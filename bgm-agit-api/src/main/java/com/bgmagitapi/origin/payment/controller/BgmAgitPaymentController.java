package com.bgmagitapi.origin.payment.controller;

import com.bgmagitapi.origin.payment.controller.request.PaymentOrderCreateRequest;
import com.bgmagitapi.origin.payment.controller.request.PaymentConfirmRequest;
import com.bgmagitapi.origin.payment.controller.response.PaymentConfirmResponse;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.service.BgmAgitReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitPaymentController {

    // 예약 검증·금액계산은 예약 도메인이 담당하고, 그 안에서 공통 PaymentService.createOrder 를 호출한다
    private final BgmAgitReservationService bgmAgitReservationService;
    private final PaymentService paymentService;

    // 결제 주문 생성: 예약번호를 받아 결제행을 READY로 만들고 프론트 위젯용 주문정보를 반환
    @PostMapping("/payments/order")
    public PaymentOrderResponse createPaymentOrder(@RequestBody @Valid PaymentOrderCreateRequest request,
                                                   @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("id");
        return bgmAgitReservationService.createPaymentOrder(request.getReservationNo(), userId);
    }

    @PostMapping("/payments/confirm")
    public PaymentConfirmResponse confirmPayment(@RequestBody @Valid PaymentConfirmRequest request,
                                                 @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("id");
        return paymentService.confirmPayment(request.getPaymentKey(), request.getOrderId(), request.getAmount(), userId);
    }
}
