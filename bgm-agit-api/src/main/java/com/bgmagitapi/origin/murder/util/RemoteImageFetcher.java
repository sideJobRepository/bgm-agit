package com.bgmagitapi.origin.murder.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
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
import java.time.Duration;
import java.util.Locale;
import java.util.Map;

/**
 * 관리자가 붙여넣은 이미지 주소를 서버가 대신 받아온다(머더 게임 표지).
 * 브라우저에서 직접 받으면 CORS 로 막혀서 서버를 거친다.
 *
 * 서버가 남의 주소를 여는 것이라 내부망을 찌르는 통로가 되지 않게 막는다.
 * - http/https 만, 호스트가 사설·루프백·링크로컬 등으로 풀리면 거부
 * - 리다이렉트는 직접 따라가며 매 단계 같은 검사(자동으로 따라가면 공개 주소 → 내부 주소 우회가 된다)
 * - image/* 가 아니거나 10MB 를 넘으면 거부
 * 검사와 실제 연결 사이에 DNS 가 바뀌는 경우까지는 막지 않는다. 관리자 전용 기능이라 거기까지는 두지 않았다
 */
@Component
public class RemoteImageFetcher {

    private static final int MAX_BYTES = 10 * 1024 * 1024;
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

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    public FetchedImage fetch(String rawUrl) {
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
            return read(response);
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
                .header("Accept", "image/*")
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

    private FetchedImage read(HttpResponse<InputStream> response) {
        String contentType = response.headers().firstValue("Content-Type").orElse("")
                .split(";")[0].trim().toLowerCase(Locale.ROOT);
        String ext = EXT_BY_TYPE.get(contentType);
        if (ext == null) {
            close(response);
            throw fail("이미지 주소가 아닙니다(" + (contentType.isEmpty() ? "형식 없음" : contentType) + "). 이미지를 우클릭해 '이미지 주소 복사'로 받은 주소를 넣어 주세요.");
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

    private ValidException fail(String reason) {
        return new ValidException("이미지를 가져올 수 없습니다: " + reason);
    }

    public record FetchedImage(byte[] bytes, String contentType, String ext) {
    }
}
