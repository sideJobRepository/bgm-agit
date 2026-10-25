package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * 원작사(The Pandemonium Institute)가 공개 배포하는 시계탑 데이터를 받는다.
 * 포켓 그리모어 등 커뮤니티 도구도 같은 주소를 쓴다. 공식 문서가 있는 API 가 아니라 형식이 바뀌면
 * {@link ClockTowerOfficialData} 가 거절하고, 기존 사전은 그대로 남는다.
 */
@Slf4j
@Component
public class ClockTowerOfficialDataClient {

    private static final String ROLES_URL = "https://release.botc.app/resources/data/roles.json";
    private static final String NIGHTSHEET_URL = "https://release.botc.app/resources/data/nightsheet.json";
    private static final String JINXES_URL = "https://release.botc.app/resources/data/jinxes.json";
    private static final String KO_URL =
            "https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/refs/heads/main/game/ko.json";

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(20);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ClockTowerOfficialDataClient(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(CONNECT_TIMEOUT)
                .withReadTimeout(READ_TIMEOUT);
        this.restClient = restClientBuilder
                .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings))
                .build();
        this.objectMapper = objectMapper;
    }

    public record Bundle(JsonNode roles, JsonNode nightsheet, JsonNode jinxes, JsonNode ko) {
    }

    public Bundle fetch() {
        return new Bundle(get(ROLES_URL), get(NIGHTSHEET_URL), get(JINXES_URL), get(KO_URL));
    }

    // raw.githubusercontent 는 text/plain 으로 내려주므로 문자열로 받아 직접 읽는다
    private JsonNode get(String url) {
        try {
            String body = restClient.get().uri(url).retrieve().body(String.class);
            return objectMapper.readTree(body);
        } catch (Exception e) {
            log.warn("[clocktower] 공식 데이터 받기 실패 {}: {}", url, e.getMessage());
            throw new ValidException("공식 데이터를 받지 못했습니다. 잠시 후 다시 시도해 주세요.");
        }
    }
}
