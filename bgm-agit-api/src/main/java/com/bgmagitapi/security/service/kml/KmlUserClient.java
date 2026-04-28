package com.bgmagitapi.security.service.kml;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
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
     * 닉네임으로 KML kml_id를 확보한다.
     *  - 단건 매칭 -> 그 id 반환
     *  - 매칭 0건 -> KML 신규 등록 후 발급된 user_id 반환
     *  - 다중 매칭/조회 실패/등록 실패 -> Optional.empty() (다음 주기에 재시도)
     */
    public Optional<Long> findOrRegisterKmlIdByNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            log.info("[KML] 닉네임 비어있음 -> 연결 생략");
            return Optional.empty();
        }

        LookupResult result = lookup(nickname);
        return switch (result.status()) {
            case MATCHED -> Optional.of(result.id());
            case NOT_FOUND -> registerAndResolve(nickname);
            case AMBIGUOUS, ERROR -> Optional.empty();
        };
    }

    private LookupResult lookup(String nickname) {
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
                return LookupResult.error();
            }

            KmlUserListResponse response;
            try {
                response = objectMapper.readValue(rawBody, KmlUserListResponse.class);
            } catch (Exception parseEx) {
                log.warn("[KML] 응답 파싱 실패 cause={} rawPreview={}",
                        parseEx.toString(),
                        rawBody.substring(0, Math.min(rawBody.length(), 500)));
                return LookupResult.error();
            }

            if (response == null || response.getUsers() == null) {
                log.warn("[KML] users 필드 null -> 포맷 확인 필요. status={}, count={}",
                        response == null ? null : response.getStatus(),
                        response == null ? null : response.getCount());
                return LookupResult.error();
            }

            String target = nickname.trim();
            List<KmlUserListResponse.User> matched = response.getUsers().stream()
                    .filter(u -> u.getNick() != null && u.getNick().trim().equals(target))
                    .toList();

            log.info("[KML] 조회 결과 총={}건, 매칭={}건, target=[{}]",
                    response.getUsers().size(), matched.size(), target);

            if (matched.size() == 1) {
                Long id = matched.get(0).getId();
                log.info("[KML] 단건 매칭 성공 nickname=[{}] -> kmlId={}", nickname, id);
                return LookupResult.matched(id);
            }
            if (matched.isEmpty()) {
                log.info("[KML] 매칭 0건, 샘플 nick 3개={}",
                        response.getUsers().stream().limit(3).map(KmlUserListResponse.User::getNick).toList());
                return LookupResult.notFound();
            }
            log.info("[KML] 중복 매칭 {}건 ids={} -> 자동 연결 생략",
                    matched.size(),
                    matched.stream().map(KmlUserListResponse.User::getId).toList());
            return LookupResult.ambiguous();
        } catch (Exception e) {
            log.warn("[KML] 호출 실패 url={}, nickname=[{}], cause={}", url, nickname, e.toString());
            return LookupResult.error();
        }
    }

    private Optional<Long> registerAndResolve(String nickname) {
        String url = kmlBaseUrl + "/api_user_register.php";

        try {
            String rawBody = RestClient.create().post()
                    .uri(url)
                    .header("x-api-key", kmlApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("nick", nickname))
                    .retrieve()
                    .body(String.class);

            log.info("[KML] 신규 등록 요청 url={}, nickname=[{}], rawLen={}",
                    url, nickname, rawBody == null ? 0 : rawBody.length());

            if (rawBody == null || rawBody.isBlank()) {
                log.warn("[KML] 신규 등록 응답 비어있음");
                return Optional.empty();
            }

            KmlUserRegisterResponse response;
            try {
                response = objectMapper.readValue(rawBody, KmlUserRegisterResponse.class);
            } catch (Exception parseEx) {
                log.warn("[KML] 신규 등록 응답 파싱 실패 cause={} rawPreview={}",
                        parseEx.toString(),
                        rawBody.substring(0, Math.min(rawBody.length(), 500)));
                return Optional.empty();
            }

            if (response != null && response.getUserId() != null) {
                log.info("[KML] 신규 등록 성공 nickname=[{}] -> kmlId={}", nickname, response.getUserId());
                return Optional.of(response.getUserId());
            }
            log.warn("[KML] 신규 등록 응답에 user_id 없음 status={}, message={}",
                    response == null ? null : response.getStatus(),
                    response == null ? null : response.getMessage());
            return Optional.empty();
        } catch (HttpClientErrorException.Conflict e) {
            // 409: 호출 사이에 누군가 같은 닉네임을 등록했거나 이미 존재
            log.info("[KML] 신규 등록 409 충돌 nickname=[{}] -> 단건 재조회", nickname);
            LookupResult retry = lookup(nickname);
            if (retry.status() == LookupResult.Status.MATCHED) {
                return Optional.of(retry.id());
            }
            log.info("[KML] 409 후 재조회 status={} -> 다음 주기에 재시도", retry.status());
            return Optional.empty();
        } catch (Exception e) {
            log.warn("[KML] 신규 등록 호출 실패 url={}, nickname=[{}], cause={}", url, nickname, e.toString());
            return Optional.empty();
        }
    }

    private record LookupResult(Status status, Long id) {
        enum Status { MATCHED, NOT_FOUND, AMBIGUOUS, ERROR }

        static LookupResult matched(Long id) { return new LookupResult(Status.MATCHED, id); }
        static LookupResult notFound() { return new LookupResult(Status.NOT_FOUND, null); }
        static LookupResult ambiguous() { return new LookupResult(Status.AMBIGUOUS, null); }
        static LookupResult error() { return new LookupResult(Status.ERROR, null); }
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

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KmlUserRegisterResponse {
        private String status;

        @JsonProperty("user_id")
        private Long userId;

        private String nick;
        private String message;
    }
}
