package com.bgmagitapi.origin.murder.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 관리자가 붙여넣은 주소에서 표지 이미지를 서버가 대신 받아온다(머더 게임 표지).
 * 브라우저에서 직접 받으면 CORS 로 막혀서 서버를 거친다.
 *
 * 이미지 주소뿐 아니라 텀블벅 프로젝트·판매처 상품 같은 **페이지 주소**도 받는다.
 * 페이지면 공유용 대표 이미지(og:image, 없으면 twitter:image)를 꺼내 그걸 받는다.
 * 텀블벅은 robots 가 검색만 막고 프로젝트 페이지는 열어 둬서, 사람이 찾은 페이지 하나를 여는 건 괜찮다.
 *
 * 서버가 남의 주소를 여는 것이라 내부망을 찌르는 통로가 되지 않게 막는다.
 * - http/https 만, 호스트가 사설·루프백·링크로컬 등으로 풀리면 거부
 * - 리다이렉트는 직접 따라가며 매 단계 같은 검사(자동으로 따라가면 공개 주소 → 내부 주소 우회가 된다)
 * - 페이지에서 꺼낸 이미지 주소도 같은 검사를 거친다
 * - 이미지가 아니거나 10MB 를 넘으면 거부
 * 검사와 실제 연결 사이에 DNS 가 바뀌는 경우까지는 막지 않는다. 관리자 전용 기능이라 거기까지는 두지 않았다
 */
@Component
public class RemoteImageFetcher {

    private static final int MAX_BYTES = 10 * 1024 * 1024;
    // 대표 이미지 태그는 head 에 있으니 페이지는 앞부분만 읽는다
    private static final int MAX_PAGE_BYTES = 2 * 1024 * 1024;
    private static final int MAX_REDIRECTS = 3;
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(10);

    private static final Map<String, String> EXT_BY_TYPE = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/png", "png",
            "image/gif", "gif",
            "image/webp", "webp",
            "image/avif", "avif"
    );

    private static final List<String> PAGE_IMAGE_SELECTORS = List.of(
            "meta[property=og:image]",
            "meta[name=og:image]",
            "meta[property=og:image:url]",
            "meta[name=twitter:image]",
            "meta[property=twitter:image]"
    );

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    /** 이미지 바이트를 받는다. 페이지 주소면 대표 이미지를 받는다 */
    public FetchedImage fetch(String rawUrl) {
        HttpResponse<InputStream> response = open(rawUrl);
        String type = contentType(response);
        if (isHtml(type)) {
            response = open(pageImageUrl(response));
            type = contentType(response);
        }
        return readImage(response, type);
    }

    /**
     * 실제로 받게 될 이미지 주소만 알려준다(화면 미리보기용). 페이지면 대표 이미지 주소, 이미지면 리다이렉트 끝 주소.
     * 저장 때는 이 주소로 다시 fetch 하므로 미리보기와 저장본이 같다
     */
    public String resolveImageUrl(String rawUrl) {
        HttpResponse<InputStream> response = open(rawUrl);
        String type = contentType(response);
        if (isHtml(type)) {
            return pageImageUrl(response);
        }
        close(response);
        if (!EXT_BY_TYPE.containsKey(type)) throw notImage(type);
        return response.uri().toString();
    }

    // 리다이렉트를 따라가 200 응답을 연다. 매 단계 내부 주소 검사
    private HttpResponse<InputStream> open(String rawUrl) {
        URI uri = parse(rawUrl);
        for (int hop = 0; hop <= MAX_REDIRECTS; hop++) {
            checkPublicHost(uri);
            HttpResponse<InputStream> response = send(uri);
            int status = response.statusCode();

            if (status >= 300 && status < 400) {
                close(response);
                String location = response.headers().firstValue("Location")
                        .orElseThrow(() -> fail("리다이렉트 주소가 없습니다."));
                uri = parse(uri.resolve(location).toString());
                continue;
            }
            if (status != 200) {
                close(response);
                throw fail("응답 코드 " + status);
            }
            return response;
        }
        throw fail("리다이렉트가 너무 많습니다.");
    }

    private URI parse(String rawUrl) {
        URI uri;
        try {
            uri = URI.create(rawUrl.trim());
        } catch (IllegalArgumentException e) {
            throw fail("주소 형식이 올바르지 않습니다.");
        }
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (!scheme.equals("http") && !scheme.equals("https") || uri.getHost() == null) {
            throw fail("http(s) 주소만 쓸 수 있습니다.");
        }
        return uri;
    }

    private void checkPublicHost(URI uri) {
        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(uri.getHost());
        } catch (UnknownHostException e) {
            throw fail("주소를 찾을 수 없습니다.");
        }
        for (InetAddress address : addresses) {
            if (address.isLoopbackAddress() || address.isSiteLocalAddress() || address.isLinkLocalAddress()
                    || address.isAnyLocalAddress() || address.isMulticastAddress() || isUniqueLocalV6(address)) {
                throw fail("내부 주소는 쓸 수 없습니다.");
            }
        }
    }

    // fc00::/7. isSiteLocalAddress 는 옛 fec0::/10 만 본다
    private boolean isUniqueLocalV6(InetAddress address) {
        byte[] bytes = address.getAddress();
        return bytes.length == 16 && (bytes[0] & 0xfe) == 0xfc;
    }

    private HttpResponse<InputStream> send(URI uri) {
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(READ_TIMEOUT)
                // 일부 CDN 은 UA 가 없으면 거절한다
                .header("User-Agent", "Mozilla/5.0 (compatible; bgmagit-image-fetcher)")
                .header("Accept", "image/*,text/html;q=0.9,*/*;q=0.8")
                .GET()
                .build();
        try {
            return client.send(request, HttpResponse.BodyHandlers.ofInputStream());
        } catch (IOException e) {
            throw fail("연결에 실패했습니다.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw fail("중단되었습니다.");
        }
    }

    private String contentType(HttpResponse<InputStream> response) {
        return response.headers().firstValue("Content-Type").orElse("")
                .split(";")[0].trim().toLowerCase(Locale.ROOT);
    }

    private boolean isHtml(String type) {
        return type.equals("text/html") || type.equals("application/xhtml+xml");
    }

    // 페이지에서 대표 이미지 주소를 꺼낸다. 상대 주소는 페이지 기준으로 푼다
    private String pageImageUrl(HttpResponse<InputStream> response) {
        String html;
        try (InputStream in = response.body()) {
            html = new String(in.readNBytes(MAX_PAGE_BYTES), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw fail("페이지를 읽는 중 끊겼습니다.");
        }
        Document doc = Jsoup.parse(html, response.uri().toString());
        for (String selector : PAGE_IMAGE_SELECTORS) {
            Element meta = doc.selectFirst(selector);
            if (meta != null && !meta.absUrl("content").isEmpty()) {
                return meta.absUrl("content");
            }
        }
        throw fail("페이지에서 대표 이미지를 찾지 못했습니다. 이미지를 우클릭해 '이미지 주소 복사'로 넣어 주세요.");
    }

    private FetchedImage readImage(HttpResponse<InputStream> response, String contentType) {
        String ext = EXT_BY_TYPE.get(contentType);
        if (ext == null) {
            close(response);
            throw notImage(contentType);
        }

        try (InputStream in = response.body()) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int total = 0;
            int n;
            while ((n = in.read(buffer)) != -1) {
                total += n;
                if (total > MAX_BYTES) throw fail("10MB 를 넘습니다.");
                out.write(buffer, 0, n);
            }
            if (total == 0) throw fail("빈 파일입니다.");
            return new FetchedImage(out.toByteArray(), contentType, ext);
        } catch (IOException e) {
            throw fail("내려받는 중 끊겼습니다.");
        }
    }

    private void close(HttpResponse<InputStream> response) {
        try {
            response.body().close();
        } catch (IOException ignore) {
            // 버리는 응답이라 닫기 실패는 상관없다
        }
    }

    private ValidException notImage(String contentType) {
        return fail("이미지나 페이지 주소가 아닙니다(" + (contentType.isEmpty() ? "형식 없음" : contentType) + ").");
    }

    private ValidException fail(String reason) {
        return new ValidException("이미지를 가져올 수 없습니다: " + reason);
    }

    public record FetchedImage(byte[] bytes, String contentType, String ext) {
    }
}
