package com.bgmagitapi.origin.murder.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * 머미로그(murdermysterylog.com, 머더미스터리 리뷰 사이트)에서 표지 후보를 찾는다.
 *
 * 화면이 쓰는 JSON API 를 그대로 부른다(공개 문서는 없다. 2026-10-12 화면 번들에서 확인).
 * - 검색 `GET /api/theme/search?keyword=` → [{index, title, description(제작사)}]
 * - 상세 `GET /api/posts/{index}` → {mm: {image, minheadcount, maxheadcount, time, ...}}
 * 이미지는 파일명만 오면 `https://murdermysterylog.com/images/{파일명}`, 주소면 그대로.
 *
 * 머더미스터리 전용 사이트라 보드라이프(일반 보드게임과 이름이 겹친다)보다 훨씬 잘 맞는다 —
 * 표지 없던 161개 중 보드라이프 65개, 머미로그 108개에서 후보가 나왔다. 그래서 보드라이프는 뺐다.
 * 응답 형식이 바뀌면 후보가 0개로 나온다. 그때는 위 두 API 부터 볼 것
 */
@Slf4j
@Component
public class MurderLogCoverSearcher {

    private static final String API = "https://ser.murdermysterylog.com/api";
    private static final String IMAGE_BASE = "https://murdermysterylog.com/images/";
    private static final String PAGE_BASE = "https://murdermysterylog.com/detail/";
    // 상세를 후보마다 한 번씩 부르므로 너무 많이 보여주지 않는다
    private static final int MAX_CANDIDATES = 8;

    private final ObjectMapper objectMapper;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public MurderLogCoverSearcher(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * 검색어를 줄여 가며 처음으로 결과가 나온 검색어의 후보. 실패하면 빈 목록.
     * 우리 게임명은 "미스터리 파티 시리즈 : 강변 밤의 꿈"처럼 시리즈명이 붙거나 표기가 조금씩 달라
     * 그대로는 안 걸리는 게 많다(머미로그는 "강변 밤의 꿈")
     */
    public List<CoverCandidate> search(String gameName) {
        for (String query : queries(gameName)) {
            List<CoverCandidate> found = searchExact(query);
            if (!found.isEmpty()) return found;
        }
        return List.of();
    }

    /** 검색어 하나 그대로. 자동 채우기는 이 결과만 믿는다(줄인 검색어 결과는 사람이 고른다) */
    public List<CoverCandidate> searchExact(String query) {
        if (query == null || query.isBlank()) return List.of();
        try {
            JsonNode list = getJson("/theme/search?keyword=" + URLEncoder.encode(query.trim(), StandardCharsets.UTF_8));
            List<CoverCandidate> result = new ArrayList<>();
            for (JsonNode item : list) {
                if (result.size() >= MAX_CANDIDATES) break;
                CoverCandidate candidate = detail(item.path("index").asText(), item.path("title").asText());
                if (candidate != null) result.add(candidate);
            }
            return result;
        } catch (IOException e) {
            log.warn("[머미로그] 검색 실패 query={} : {}", query, e.getMessage());
            return List.of();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return List.of();
        }
    }

    private CoverCandidate detail(String index, String title) throws IOException, InterruptedException {
        if (index.isBlank()) return null;
        JsonNode mm = getJson("/posts/" + URLEncoder.encode(index, StandardCharsets.UTF_8)).path("mm");
        String image = mm.path("image").asText("").trim();
        if (image.isEmpty()) return null;
        String imageUrl = image.startsWith("http") ? image : IMAGE_BASE + image;
        return new CoverCandidate(
                title.trim(),
                imageUrl,
                imageUrl,
                PAGE_BASE + index,
                intOrNull(mm.path("minheadcount")),
                intOrNull(mm.path("maxheadcount")),
                intOrNull(mm.path("time"))
        );
    }

    private JsonNode getJson(String path) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(API + path))
                .timeout(Duration.ofSeconds(10))
                .header("User-Agent", "Mozilla/5.0 (compatible; bgmagit-cover-search)")
                .header("Accept", "application/json")
                .GET()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() != 200) throw new IOException("응답 코드 " + response.statusCode());
        return objectMapper.readTree(response.body());
    }

    // 값이 "5"·5·"" 처럼 섞여 온다
    private static Integer intOrNull(JsonNode node) {
        String text = node.asText("").trim();
        if (!text.matches("\\d{1,4}")) return null;
        int value = Integer.parseInt(text);
        return value > 0 ? value : null;
    }

    /**
     * 시도할 검색어 순서: 전체 이름 → 구분자(: - ~ · "1.")로 나눈 조각을 뒤에서부터(부제가 보통 뒤) → 앞 두 단어.
     * 2글자 미만 조각은 뺀다("up" 같은 조각이 엉뚱한 결과를 끌어온다)
     */
    static List<String> queries(String gameName) {
        Set<String> result = new LinkedHashSet<>();
        if (gameName == null || gameName.isBlank()) return List.of();
        String name = gameName.trim();
        result.add(name);

        String[] parts = name.split("\\s*[:：\\-~·]\\s*|\\s+\\d+\\.\\s+|\\.\\s+");
        for (int i = parts.length - 1; i >= 0; i--) {
            String part = parts[i].trim();
            if (part.length() >= 2 && !part.matches("(?i)[a-z]{1,3}")) result.add(part);
        }
        String[] words = name.split("\\s+");
        if (words.length >= 3) result.add(words[0] + " " + words[1]);
        return new ArrayList<>(result);
    }

    /** "같은 게임" 판정용. 띄어쓰기·문장부호·대소문자 차이만 무시한다. 더 느슨하게 하면 다른 게임 표지가 붙는다 */
    public static String normalize(String name) {
        if (name == null) return "";
        return name.toLowerCase(Locale.ROOT).replaceAll("[\\s\\p{Punct}·:：「」『』<>《》()\\[\\]]", "");
    }

    /** 인원·시간은 머미로그 값(없으면 null). 정리 화면에서 비어 있는 칸만 채우는 데 쓴다 */
    public record CoverCandidate(String title, String thumbnailUrl, String imageUrl, String pageUrl,
                                 Integer minPlayers, Integer maxPlayers, Integer playMinutes) {
    }
}
