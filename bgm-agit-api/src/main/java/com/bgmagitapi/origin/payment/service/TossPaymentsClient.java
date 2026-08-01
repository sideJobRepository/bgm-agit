package com.bgmagitapi.origin.payment.service;

import com.bgmagitapi.origin.payment.service.request.TossPaymentCancelRequest;
import com.bgmagitapi.origin.payment.service.request.TossPaymentConfirmRequest;
import com.bgmagitapi.origin.payment.service.response.TossPaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

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

    public TossPaymentResponse confirm(String paymentKey, String orderId, Integer amount) {
        return restClientBuilder.build()
                .post()
                .uri(confirmUrl)
                .header(HttpHeaders.AUTHORIZATION, basicAuthorization())
                .contentType(MediaType.APPLICATION_JSON)
                .body(new TossPaymentConfirmRequest(paymentKey, orderId, amount))
                .retrieve()
                .body(TossPaymentResponse.class);
    }

    public TossPaymentResponse cancel(String paymentKey, String cancelReason) {
        return restClientBuilder.build()
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
