package com.bgmagitapi.origin.payment.service;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * 결제 실패 사유 기록 전용 컴포넌트.
 *
 * <p>승인 흐름 안에서 {@code markAborted()} 를 부르면 곧바로 예외를 다시 던지므로 트랜잭션이
 * 통째로 롤백되어 실패 이력이 하나도 남지 않았다. 그래서 기록만 <b>별도 트랜잭션</b>
 * ({@code REQUIRES_NEW})으로 떼어낸다.
 *
 * <p>프록시가 걸려야 새 트랜잭션이 열리므로 <b>반드시 별도 빈</b>이어야 한다(self-invocation 금지).
 * 바깥 영속성 컨텍스트의 엔티티를 넘겨받지 않고 orderNo 로 다시 조회하는 것도 같은 이유
 * (넘겨받은 엔티티는 롤백 대상이다).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentFailureRecorder {

    // BGM_AGIT_PAYMENT_FAIL_REASON 은 varchar(500)
    private static final int FAIL_REASON_MAX_LENGTH = 500;

    private final BgmAgitPaymentRepository bgmAgitPaymentRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAborted(String orderId, String code, String message) {
        try {
            if (orderId == null || orderId.isBlank()) {
                log.warn("[payment] 실패 기록 스킵. orderId 없음");
                return;
            }

            BgmAgitPayment payment = bgmAgitPaymentRepository.findByBgmAgitOrderNo(orderId).orElse(null);
            if (payment == null) {
                log.warn("[payment] 실패 기록 스킵. 주문 없음 orderId={}", orderId);
                return;
            }

            // 이미 승인/취소까지 간 건은 결제 이력이라 덮어쓰지 않는다. ABORTED 는 최신 사유로 갱신 허용
            PaymentStatus status = payment.getBgmAgitPaymentStatus();
            if (status != PaymentStatus.READY && status != PaymentStatus.ABORTED) {
                log.warn("[payment] 실패 기록 스킵. 이미 처리된 결제 orderId={}, status={}", orderId, status);
                return;
            }

            payment.markAborted(buildFailReason(code, message));
        } catch (RuntimeException e) {
            // 기록 실패가 원래 흐름(=손님에게 보여줄 에러)을 덮으면 안 된다
            log.warn("[payment] 실패 기록 중 오류. orderId={}, code={}", orderId, code, e);
        }
    }

    /** 사유 문자열 조립. 코드가 있으면 "[코드] 메시지" 형태로 남기고 컬럼 길이에 맞춰 자른다 */
    private String buildFailReason(String code, String message) {
        String reason = (code == null || code.isBlank()) ? message : "[" + code + "] " + message;
        if (reason == null) {
            return null;
        }
        return reason.length() > FAIL_REASON_MAX_LENGTH ? reason.substring(0, FAIL_REASON_MAX_LENGTH) : reason;
    }
}
