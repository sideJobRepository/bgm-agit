package com.bgmagitapi.security.service.kml;

import com.bgmagitapi.event.dto.KmlRecordSubmitEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class KmlRecordClient {

    @Value("${kml.url}")
    private String kmlBaseUrl;

    @Value("${kml.api.key}")
    private String kmlApiKey;

    /**
     * KML record_submit_api.php 로 한 게임의 결과를 송신.
     * 실패해도 호출자에게 예외를 던지지 않는다 (우리 DB 저장과 분리).
     */
    public void submit(KmlRecordSubmitEvent event) {
        String url = kmlBaseUrl + "/record_submit_api.php";

        List<Map<String, Object>> players = event.getPlayers().stream()
                .map(p -> Map.<String, Object>of(
                        "user_id", p.userId(),
                        "point", p.point(),
                        "wind", p.wind()
                ))
                .toList();

        Map<String, Object> body = Map.of(
                "game_length", event.getGameLength(),
                "common_point", event.getCommonPoint(),
                "players", players
        );

        try {
            String response = RestClient.create().post()
                    .uri(url)
                    .header("x-api-key", kmlApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            log.info("[KML] record_submit 송신 성공 url={}, response={}", url, response);
        } catch (Exception e) {
            log.warn("[KML] record_submit 송신 실패 url={}, body={}, cause={}", url, body, e.toString());
        }
    }
}
