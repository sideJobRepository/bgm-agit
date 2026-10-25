package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 커스텀 시계탑(botc.vnamu.com) 시트 주소로 스크립트 JSON 을 받아온다.
 * 시트마다 표준 스크립트 JSON 내려받기(/api/download-json/{slug})가 있고, _meta 에 제목·작성자·밤 순서가 들어 있다.
 * 받는 주소: /sheets/{번호}(페이지에서 내려받기 링크를 찾음) · /sheet/{slug} · /api/download-json/{slug} (앞에 /en 가능)
 * 서버가 임의 주소를 받지 않도록 이 사이트만 허용하고, 실제 요청 주소는 slug 로 다시 만든다.
 */
@Slf4j
@Component
public class VnamuScriptFetcher {

    private static final String HOST = "botc.vnamu.com";
    private static final String BASE = "https://" + HOST;
    private static final int MAX_BYTES = 1024 * 1024;

    private static final Pattern SLUG_PATH = Pattern.compile("^(?:/en)?/(?:sheet|api/download-json)/([A-Za-z0-9_-]{1,40})/?$");
    private static final Pattern NUMBER_PATH = Pattern.compile("^(?:/en)?/sheets/(\\d{1,10})/?$");
    // 페이지 안 링크는 HTML 엔티티로 이스케이프돼 있다(&#x2F; = /)
    private static final Pattern DOWNLOAD_LINK = Pattern.compile("api(?:/|&#x2F;|&#47;)download-json(?:/|&#x2F;|&#47;)([A-Za-z0-9_-]{1,40})");

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(15);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public VnamuScriptFetcher(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(CONNECT_TIMEOUT)
                .withReadTimeout(READ_TIMEOUT);
        this.restClient = restClientBuilder
                .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings))
                .build();
        this.objectMapper = objectMapper;
    }

    /** @param json 스크립트 JSON 원문(들여쓰기 정리) — 등록 화면 입력칸에 그대로 넣는다 */
    public record Fetched(String name, String author, String json) {
    }

    public Fetched fetch(String url) {
        String slug = resolveSlug(url);
        String body = get(BASE + "/api/download-json/" + slug);
        try {
            JsonNode root = objectMapper.readTree(body);
            if (root == null || !root.isArray()) {
                throw new ValidException("시트 JSON 형식이 올바르지 않습니다.");
            }
            String name = null;
            String author = null;
            for (JsonNode item : root) {
                if (item.isObject() && "_meta".equals(item.path("id").asText())) {
                    name = blankToNull(item.path("name").asText(null));
                    author = blankToNull(item.path("author").asText(null));
                    break;
                }
            }
            return new Fetched(name, author, objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root));
        } catch (ValidException e) {
            throw e;
        } catch (Exception e) {
            throw new ValidException("시트 JSON 을 읽지 못했습니다.");
        }
    }

    /** 시트 주소 → 내려받기 slug. 숫자 주소면 페이지에서 내려받기 링크를 찾는다 */
    String resolveSlug(String url) {
        URI uri = parse(url);
        String path = uri.getPath() == null ? "" : uri.getPath();
        Matcher slug = SLUG_PATH.matcher(path);
        if (slug.matches()) return slug.group(1);
        Matcher number = NUMBER_PATH.matcher(path);
        if (number.matches()) {
            String html = get(BASE + "/sheets/" + number.group(1));
            Matcher link = DOWNLOAD_LINK.matcher(html);
            if (link.find()) return link.group(1);
            throw new ValidException("시트 페이지에서 JSON 내려받기 링크를 찾지 못했습니다.");
        }
        throw new ValidException("커스텀 시계탑 시트 주소가 아닙니다. 예: https://botc.vnamu.com/sheets/12");
    }

    private static URI parse(String url) {
        if (url == null || url.isBlank()) throw new ValidException("시트 주소를 입력해 주세요.");
        try {
            URI uri = URI.create(url.trim());
            String scheme = uri.getScheme();
            if (!("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))
                    || !HOST.equalsIgnoreCase(uri.getHost())) {
                throw new ValidException("botc.vnamu.com 시트 주소만 불러올 수 있습니다.");
            }
            return uri;
        } catch (IllegalArgumentException e) {
            throw new ValidException("주소 형식이 올바르지 않습니다.");
        }
    }

    private String get(String url) {
        try {
            byte[] bytes = restClient.get().uri(url).header("User-Agent", "bgm-agit").retrieve().body(byte[].class);
            if (bytes == null || bytes.length == 0) throw new ValidException("시트를 받지 못했습니다.");
            if (bytes.length > MAX_BYTES) throw new ValidException("시트가 너무 큽니다.");
            return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        } catch (ValidException e) {
            throw e;
        } catch (Exception e) {
            log.warn("[clocktower] 시트 받기 실패 {}: {}", url, e.getMessage());
            throw new ValidException("시트를 받지 못했습니다. 주소를 확인하거나 잠시 후 다시 시도해 주세요.");
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
