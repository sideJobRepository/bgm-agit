package com.bgmagitapi.origin.murder.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * 보드라이프 게임 검색 결과에서 표지 후보를 뽑는다(머더 게임 표지 자동 찾기).
 *
 * 텀블벅은 robots.txt 가 검색(/search?)을 막고 결과도 자바스크립트로 그려서 쓰지 않는다.
 * 보드라이프는 검색 결과가 HTML 로 오고 robots 도 검색을 막지 않는다(2026-10-12 확인).
 * 화면 구조(a.search-game-card)에 기대므로 사이트가 바뀌면 후보가 0개로 나온다. 그때는 선택자를 다시 볼 것
 */
@Component
public class BoardlifeCoverSearcher {

    private static final String SEARCH_URL = "https://boardlife.co.kr/search.php?page=game&query=";
    private static final String NO_THUMB = "no-thumb";

    public List<CoverCandidate> search(String gameName) {
        if (gameName == null || gameName.isBlank()) return List.of();

        Document doc;
        try {
            doc = Jsoup.connect(SEARCH_URL + URLEncoder.encode(gameName.trim(), StandardCharsets.UTF_8))
                    .userAgent("Mozilla/5.0 (compatible; bgmagit-cover-search)")
                    .timeout(10_000)
                    .get();
        } catch (IOException e) {
            throw new ValidException("보드라이프 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }

        List<CoverCandidate> result = new ArrayList<>();
        for (Element card : doc.select("a.search-game-card")) {
            Element img = card.selectFirst("img");
            Element title = card.selectFirst(".search-game-title");
            if (img == null || title == null) continue;
            String thumb = img.absUrl("src");
            if (thumb.isEmpty() || thumb.contains(NO_THUMB)) continue;
            result.add(new CoverCandidate(title.text().trim(), thumb, largeImageUrl(thumb), card.absUrl("href")));
        }
        return result;
    }

    // 목록 썸네일은 끝에 _w100 이 붙은 100px 판이다. 떼면 원본이 나온다(..._lg_w100.jpg → ..._lg.jpg)
    static String largeImageUrl(String thumbUrl) {
        return thumbUrl.replaceFirst("_w100(\\.[A-Za-z0-9]+)$", "$1");
    }

    // 자동 채우기의 "같은 게임" 판정. 띄어쓰기·문장부호·대소문자 차이만 무시한다.
    // 부제·개정판 차이까지 같다고 보면 다른 게임 표지가 붙으므로 더 느슨하게 하지 말 것
    public static String normalize(String name) {
        if (name == null) return "";
        return name.toLowerCase(Locale.ROOT).replaceAll("[\\s\\p{Punct}·:：「」『』<>《》()\\[\\]]", "");
    }

    public record CoverCandidate(String title, String thumbnailUrl, String imageUrl, String pageUrl) {
    }
}
