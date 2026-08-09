package com.bgmagitapi.origin.payment.service;

import com.bgmagitapi.origin.payment.service.request.TossPaymentCancelRequest;
import com.bgmagitapi.origin.payment.service.request.TossPaymentConfirmRequest;
import com.bgmagitapi.origin.payment.service.response.TossPaymentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Component
public class TossPaymentsClient {

    
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(30);

    private final RestClient restClient;

    public TossPaymentsClient(RestClient.Builder restClientBuilder) {
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(CONNECT_TIMEOUT)
                .withReadTimeout(READ_TIMEOUT);

        this.restClient = restClientBuilder
                .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings))
                .build();
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
                .body(TossPaymentResponse.class);
    }

    private String basicAuthorization() {
        String token = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        return "Basic " + token;
    }
}
