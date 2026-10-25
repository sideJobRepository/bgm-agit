package com.bgmagitapi.origin.clocktower.util;

import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;

/**
 * 공식 캐릭터 이미지 한 장을 받는다. 주소는 {@link ClockTowerImagePaths#SOURCE_BASE} 고정 + 검사한 경로뿐이고
 * 리다이렉트는 따라가지 않는다(요청 문자열로 다른 호스트를 찌르는 통로가 되지 않게).
 */
@Component
public class ClockTowerImageClient {

    // 한 장 15~31KB 라 넉넉히 잡아도 1MB 면 충분하다
    private static final int MAX_BYTES = 1024 * 1024;
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(8);

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(4))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    /** found=false 면 원본에 없는 파일(404) */
    public record Fetched(boolean found, byte[] bytes, String contentType) {
    }

    /** 실패(네트워크·5xx·형식 이상)는 IOException. 재시도는 부르는 쪽이 한다 */
    public Fetched fetch(String path) throws IOException {
        if (ClockTowerImagePaths.parse(path) == null) {
            throw new IOException("허용하지 않는 경로");
        }
        HttpRequest request = HttpRequest.newBuilder(URI.create(ClockTowerImagePaths.sourceUrl(path)))
                .timeout(READ_TIMEOUT)
                .header("Accept", "image/webp")
                .GET()
                .build();
        HttpResponse<InputStream> response;
        try {
            response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("중단됨");
        }
        try (InputStream body = response.body()) {
            int status = response.statusCode();
            if (status == 404 || status == 403) {
                // 원본 저장소(S3/CloudFront)는 없는 파일에 403 을 주기도 한다
                return new Fetched(false, null, null);
            }
            if (status != 200) {
                throw new IOException("원본 응답 " + status);
            }
            String type = response.headers().firstValue("Content-Type").orElse("")
                    .toLowerCase(Locale.ROOT).split(";")[0].trim();
            if (!type.equals("image/webp")) {
                throw new IOException("이미지가 아닌 응답(" + type + ")");
            }
            return new Fetched(true, readLimited(body), type);
        }
    }

    private static byte[] readLimited(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int total = 0;
        int n;
        while ((n = in.read(buf)) != -1) {
            total += n;
            if (total > MAX_BYTES) throw new IOException("파일이 너무 큽니다");
            out.write(buf, 0, n);
        }
        if (total == 0) throw new IOException("빈 파일");
        return out.toByteArray();
    }
}
