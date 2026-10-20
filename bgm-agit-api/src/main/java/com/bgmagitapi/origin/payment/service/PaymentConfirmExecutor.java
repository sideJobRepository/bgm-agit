package com.bgmagitapi.origin.payment.service;

import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.payment.controller.response.PaymentConfirmResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 결제 승인 직렬화 레이어.
 *
 * <p>승인은 "슬롯 재검증 → 토스 승인 → 예약 확정"이 통째로 원자적이어야 한다.
 * 두 사람이 같은 시간대를 대기로 들고 있다가 동시에 결제하면, 각자 재검증을 통과한 뒤
 * 둘 다 확정되는 창이 생기기 때문이다.
 *
 * <p>락은 {@link ReservationCancelExecutor} 와 <b>같은 것</b>을 쓴다. 승인 전용 락을 따로 두면
 * 승인과 취소·인원변경이 동시에 돌아 "취소됐는데 결제는 DONE·환불 없음"이 남는다(그쪽 주석 참고).
 *
 * <p>{@code @Transactional} 메서드 안에 {@code synchronized} 를 걸면 <b>커밋 전에 락이 풀려</b>
 * 뒤따라온 스레드가 아직 보이지 않는 확정건을 놓친다. 그래서 락은 트랜잭션 경계 바깥에 둔다
 * (서버 인스턴스 1대 전제. 다중화하면 DB 락이나 분산 락으로 바꿔야 한다).
 */
@Component
@RequiredArgsConstructor
public class PaymentConfirmExecutor {

    private final ReservationCancelExecutor reservationLock;

    private final PaymentService paymentService;

    public PaymentConfirmResponse confirm(String paymentKey, String orderId, Integer amount, Long memberId) {
        return reservationLock.execute(
                () -> paymentService.confirmPayment(paymentKey, orderId, amount, memberId),
                interrupted -> new ReservationConflictException(interrupted
                        ? "결제 처리가 중단되었습니다. 잠시 후 다시 시도해 주세요."
                        : "결제 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요."));
    }
}
