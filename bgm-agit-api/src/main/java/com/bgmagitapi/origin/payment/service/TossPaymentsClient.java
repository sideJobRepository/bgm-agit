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

    /**
     * 결제 취소. cancelAmount 가 null 이면 전액취소다.
     *
     * idempotencyKey 는 반드시 넘긴다. 전액취소는 토스가 ALREADY_CANCELED_PAYMENT 로 재시도를 막아주지만
     * 부분취소는 잔액이 남아 있으면 같은 요청이 그대로 또 환불된다. read timeout 30초에
     * 프론트 자동 재시도까지 있는 환경이라 중복 환불이 실제로 일어날 수 있다.
     */
    public TossPaymentResponse cancel(String paymentKey, String cancelReason, Integer cancelAmount, String idempotencyKey) {
        return restClient
                .post()
                .uri(cancelUrl + "/" + paymentKey + "/cancel")
                .header(HttpHeaders.AUTHORIZATION, basicAuthorization())
                .header("Idempotency-Key", idempotencyKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new TossPaymentCancelRequest(cancelReason, cancelAmount))
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
