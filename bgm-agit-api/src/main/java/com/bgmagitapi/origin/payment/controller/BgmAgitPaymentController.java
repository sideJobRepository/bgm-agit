package com.bgmagitapi.origin.payment.controller;

import com.bgmagitapi.origin.payment.controller.request.PaymentOrderCreateRequest;
import com.bgmagitapi.origin.payment.controller.request.PaymentConfirmRequest;
import com.bgmagitapi.origin.payment.controller.request.PaymentFailReportRequest;
import com.bgmagitapi.origin.payment.controller.response.PaymentConfirmResponse;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.service.PaymentConfirmExecutor;
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
    // 승인은 트랜잭션 바깥에서 직렬화해야 해서 PaymentService 를 직접 부르지 않는다
    private final PaymentConfirmExecutor paymentConfirmExecutor;
    // 실패 기록은 승인 직렬화 락을 거칠 이유가 없다(기록일 뿐이라 서비스를 바로 부른다)
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
        return paymentConfirmExecutor.confirm(request.getPaymentKey(), request.getOrderId(), request.getAmount(), userId);
    }

    // 결제창에서 실패/취소한 경우 프론트가 사유를 알려준다. 기록이 목적이라 항상 200(바디 없음)
    @PostMapping("/payments/fail")
    public void reportPaymentFailure(@RequestBody @Valid PaymentFailReportRequest request,
                                     @AuthenticationPrincipal Jwt jwt) {
        // /payment/fail 은 공개 라우트라 세션이 끊긴 채로도 도달한다(토스 리다이렉트 직후 새로고침).
        // URL_RESOURCES 에 매핑이 없으면 기본 permit 이라 jwt 가 null 로 들어올 수 있다 → NPE 방지.
        // userId 가 null 이면 소유자 검사에서 걸러져 기록 없이 로그만 남는다(항상 200 계약 유지).
        Long userId = jwt == null ? null : jwt.getClaim("id");
        paymentService.recordClientFailure(request.getOrderId(), request.getCode(), request.getMessage(), userId);
    }
}
