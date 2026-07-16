package com.bgmagitapi.origin.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class TossPaymentsClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${toss.secret-key}")
    private String secretKey;

    @Value("${toss.confirm-url}")
    private String confirmUrl;

    @Value("${toss.cancel-url}")
    private String cancelUrl;

    public JsonNode confirm(String paymentKey, String orderId, Integer amount) {
        return restClientBuilder.build()
                .post()
                .uri(confirmUrl)
                .header(HttpHeaders.AUTHORIZATION, basicAuthorization())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "paymentKey", paymentKey,
                        "orderId", orderId,
                        "amount", amount
                ))
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode cancel(String paymentKey, String cancelReason) {
        return restClientBuilder.build()
                .post()
                .uri(cancelUrl + "/" + paymentKey + "/cancel")
                .header(HttpHeaders.AUTHORIZATION, basicAuthorization())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("cancelReason", cancelReason))
                .retrieve()
                .body(JsonNode.class);
    }

    private String basicAuthorization() {
        String token = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        return "Basic " + token;
    }
}
