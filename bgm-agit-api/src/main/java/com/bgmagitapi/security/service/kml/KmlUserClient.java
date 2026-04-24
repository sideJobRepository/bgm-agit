package com.bgmagitapi.security.service.kml;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class KmlUserClient {

    private final ObjectMapper objectMapper;

    @Value("${kml.url}")
    private String kmlBaseUrl;

    @Value("${kml.api.key}")
    private String kmlApiKey;

    /**
     * 닉네임이 KML에서 정확히 1명에게만 일치하면 그 사용자의 id를 반환한다.
     * 0건/다중 매칭/호출 실패 시 Optional.empty().
     */
    public Optional<Long> findSingleKmlIdByNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            log.info("[KML] 닉네임 비어있음 -> 연결 생략");
            return Optional.empty();
        }

        String url = kmlBaseUrl + "/api_users.php";

        try {
            String rawBody = RestClient.create().get()
                    .uri(url)
                    .header("x-api-key", kmlApiKey)
                    .retrieve()
                    .body(String.class);

            log.info("[KML] 조회 요청 url={}, nickname=[{}], rawLen={}",
                    url, nickname, rawBody == null ? 0 : rawBody.length());

            if (rawBody == null || rawBody.isBlank()) {
                log.warn("[KML] 응답 body 비어있음");
                return Optional.empty();
            }

            KmlUserListResponse response;
            try {
                response = objectMapper.readValue(rawBody, KmlUserListResponse.class);
            } catch (Exception parseEx) {
                log.warn("[KML] 응답 파싱 실패 cause={} rawPreview={}",
                        parseEx.toString(),
                        rawBody.substring(0, Math.min(rawBody.length(), 500)));
                return Optional.empty();
            }

            if (response == null || response.getUsers() == null) {
                log.warn("[KML] users 필드 null -> 포맷 확인 필요. status={}, count={}",
                        response == null ? null : response.getStatus(),
                        response == null ? null : response.getCount());
                return Optional.empty();
            }

            String target = nickname.trim();
            List<KmlUserListResponse.User> matched = response.getUsers().stream()
                    .filter(u -> u.getNick() != null && u.getNick().trim().equals(target))
                    .toList();

            log.info("[KML] 조회 결과 총={}건, 매칭={}건, target=[{}]",
                    response.getUsers().size(), matched.size(), target);

            if (matched.size() == 1) {
                Long id = matched.get(0).getId();
                log.info("[KML] 연결 성공 nickname=[{}] -> kmlId={}", nickname, id);
                return Optional.of(id);
            }
            if (matched.isEmpty()) {
                log.info("[KML] 매칭 0건, 샘플 nick 3개={}",
                        response.getUsers().stream().limit(3).map(KmlUserListResponse.User::getNick).toList());
            } else {
                log.info("[KML] 중복 매칭 {}건 ids={} -> 연결 생략",
                        matched.size(),
                        matched.stream().map(KmlUserListResponse.User::getId).toList());
            }
            return Optional.empty();
        } catch (Exception e) {
            log.warn("[KML] 호출 실패 url={}, nickname=[{}], cause={}", url, nickname, e.toString());
            return Optional.empty();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KmlUserListResponse {
        private String status;
        private Integer count;
        private List<User> users;

        @Getter
        @Setter
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class User {
            private Long id;
            private String nick;
        }
    }
}
