package com.bgmagitapi.origin.payment.service;

import com.bgmagitapi.origin.advice.exception.TossPaymentApiException;
import com.bgmagitapi.origin.payment.service.request.TossPaymentCancelRequest;
import com.bgmagitapi.origin.payment.service.request.TossPaymentConfirmRequest;
import com.bgmagitapi.origin.payment.service.response.TossErrorResponse;
import com.bgmagitapi.origin.payment.service.response.TossPaymentResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Slf4j
@Component
public class TossPaymentsClient {

    
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(30);

    // 토스 에러 바디를 못 읽었을 때의 기본 안내
    private static final String UNKNOWN_ERROR_MESSAGE = "결제 처리 중 오류가 발생했습니다.";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public TossPaymentsClient(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(CONNECT_TIMEOUT)
                .withReadTimeout(READ_TIMEOUT);

        this.restClient = restClientBuilder
                .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings))
                .build();
        this.objectMapper = objectMapper;
    }

    @Value("${toss.secret-key}")
    private String secretKey;

    @Value("${toss.confirm-url}")
    private String confirmUrl;

    @Value("${toss.cancel-url}")
    private String cancelUrl;

    public TossPaymentResponse confirm(String paymentKey, String orderId, Integer amount) {
        return restClient
                .post()
                .uri(confirmUrl)
                .header(HttpHeaders.AUTHORIZATION, basicAuthorization())
                .contentType(MediaType.APPLICATION_JSON)
                .body(new TossPaymentConfirmRequest(paymentKey, orderId, amount))
                .retrieve()
                // 기본 예외에 맡기면 토스가 준 {code, message} 가 버려져 실패 사유를 남길 수 없다
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw toApiException(response);
                })
                .body(TossPaymentResponse.class);
    }

    public TossPaymentResponse cancel(String paymentKey, String cancelReason) {
        return restClient
                .post()
                .uri(cancelUrl + "/" + paymentKey + "/cancel")
                .header(HttpHeaders.AUTHORIZATION, basicAuthorization())
                .contentType(MediaType.APPLICATION_JSON)
                .body(new TossPaymentCancelRequest(cancelReason))
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw toApiException(response);
                })
                .body(TossPaymentResponse.class);
    }

    /** 토스 에러 바디를 {code, message} 로 파싱. 실패하면 code=null + 기본 문구로 폴백한다 */
    private TossPaymentApiException toApiException(ClientHttpResponse response) {
        String body = null;
        try {
            body = new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
            TossErrorResponse error = objectMapper.readValue(body, TossErrorResponse.class);
            if (error != null && (error.getCode() != null || error.getMessage() != null)) {
                return new TossPaymentApiException(
                        error.getCode(),
                        error.getMessage() == null ? UNKNOWN_ERROR_MESSAGE : error.getMessage()
                );
            }
        } catch (IOException | RuntimeException e) {
            log.warn("[payment] 토스 에러 바디 파싱 실패. body={}", body, e);
        }
        return new TossPaymentApiException(null, UNKNOWN_ERROR_MESSAGE);
    }

    private String basicAuthorization() {
        String token = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        return "Basic " + token;
    }
}
