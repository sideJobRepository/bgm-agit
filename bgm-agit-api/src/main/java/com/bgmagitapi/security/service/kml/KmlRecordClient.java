package com.bgmagitapi.security.service.kml;

import com.bgmagitapi.event.dto.KmlRecordModifyEvent;
import com.bgmagitapi.event.dto.KmlRecordSubmitEvent;
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
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class KmlRecordClient {

    private final ObjectMapper objectMapper;

    @Value("${kml.url}")
    private String kmlBaseUrl;

    @Value("${kml.api.key}")
    private String kmlApiKey;

    /**
     * KML api_record_submit.php 로 한 게임의 결과를 송신.
     * 성공 시 KML 측 record_id 를 반환한다. 실패해도 호출자에게 예외를 던지지 않는다.
     */
    public Optional<Long> submit(KmlRecordSubmitEvent event) {
        String url = kmlBaseUrl + "/api_record_submit.php";

        Map<String, Object> body = Map.of(
                "game_length", event.getGameLength(),
                "common_point", event.getCommonPoint(),
                "players", toPlayerPayload(event.getPlayers())
        );

        try {
            String rawBody = RestClient.create().post()
                    .uri(url)
                    .header("x-api-key", kmlApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            log.info("[KML] record_submit 송신 성공 url={}, response={}", url, rawBody);
            return parseSubmitResponse(rawBody);
        } catch (Exception e) {
            log.warn("[KML] record_submit 송신 실패 url={}, body={}, cause={}", url, body, e.toString());
            return Optional.empty();
        }
    }

    /**
     * KML api_record_modify.php 로 기존 게임 기록을 수정 송신.
     * 실패해도 예외를 던지지 않는다 (DB 수정 트랜잭션과 분리).
     */
    public void modify(KmlRecordModifyEvent event) {
        String url = kmlBaseUrl + "/api_record_modify.php";

        Map<String, Object> body = Map.of(
                "modify_id", event.getModifyId(),
                "game_length", event.getGameLength(),
                "common_point", event.getCommonPoint(),
                "players", toPlayerPayload(event.getPlayers())
        );

        try {
            String rawBody = RestClient.create().post()
                    .uri(url)
                    .header("x-api-key", kmlApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            log.info("[KML] record_modify 송신 성공 url={}, modifyId={}, response={}", url, event.getModifyId(), rawBody);
        } catch (Exception e) {
            log.warn("[KML] record_modify 송신 실패 url={}, body={}, cause={}", url, body, e.toString());
        }
    }

    private List<Map<String, Object>> toPlayerPayload(List<KmlRecordSubmitEvent.Player> players) {
        return players.stream()
                .map(p -> Map.<String, Object>of(
                        "user_id", p.userId(),
                        "point", p.point(),
                        "wind", p.wind()
                ))
                .toList();
    }

    private Optional<Long> parseSubmitResponse(String rawBody) {
        if (rawBody == null || rawBody.isBlank()) {
            log.warn("[KML] record_submit 응답 비어있음");
            return Optional.empty();
        }
        try {
            KmlRecordSubmitResponse response = objectMapper.readValue(rawBody, KmlRecordSubmitResponse.class);
            if (response.getRecordId() == null) {
                log.warn("[KML] record_submit 응답에 record_id 없음 status={}, message={}, sumCheck={}",
                        response.getStatus(), response.getMessage(), response.getSumCheck());
                return Optional.empty();
            }
            return Optional.of(response.getRecordId());
        } catch (Exception parseEx) {
            log.warn("[KML] record_submit 응답 파싱 실패 cause={} rawPreview={}",
                    parseEx.toString(),
                    rawBody.substring(0, Math.min(rawBody.length(), 500)));
            return Optional.empty();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KmlRecordSubmitResponse {
        private String status;

        @JsonProperty("record_id")
        private Long recordId;

        @JsonProperty("sum_check")
        private Integer sumCheck;

        private String message;
    }
}
