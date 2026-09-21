package com.bgmagitapi.origin.payment.service;


import com.bgmagitapi.origin.payment.entity.BgmAgitPaymentCancel;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentCancelRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * 환불 시도 이력 기록 전용 컴포넌트.
 *
 * <p>토스를 부르기 <b>전에</b> 시도 행을 커밋해야 한다. 그래야 ① 그 PK 를 멱등키로 쓸 수 있고
 * ② 호출 뒤 바깥 트랜잭션이 롤백돼도 "돈은 나갔는데 흔적이 없는" 상태가 생기지 않는다.
 * 예전에는 토스 취소를 트랜잭션 안에서 먼저 부르고 예약 상태를 뒤에 갱신해서, 뒤에서 예외가 나면
 * 환불만 되고 기록이 사라졌다. 다시 누르면 잔액이 남아 있어 또 환불됐다.
 *
 * <p>{@link PaymentFailureRecorder} 와 같은 이유로 <b>별도 빈</b>이어야 프록시가 걸려 새 트랜잭션이 열린다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCancelRecorder {

    private final BgmAgitPaymentCancelRepository bgmAgitPaymentCancelRepository;


    /**
     * 토스 호출 직전. 시도 행을 새 트랜잭션으로 커밋하고 그 행을 돌려준다(PK = 멱등키).
     *
     * 결제행을 엔티티로 참조하지 않고 id 만 넣는다. 바깥 트랜잭션이 결제행에 쓰기 잠금을
     * 걸어 둔 상태라, 부모 행을 건드리는 순간(FK 검증 포함) 서로 기다리다 잠금 타임아웃이 난다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public BgmAgitPaymentCancel begin(Long paymentId, Long reservationNo, int amount, int rate, String reason) {
        BgmAgitPaymentCancel attempt =
                new BgmAgitPaymentCancel(paymentId, reservationNo, amount, rate, reason);
        return bgmAgitPaymentCancelRepository.save(attempt);
    }

    /** 토스 취소 성공. 시도 행에 거래키를 남긴다. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void succeed(Long cancelId, String transactionKey) {
        bgmAgitPaymentCancelRepository.findById(cancelId)
                .ifPresent(attempt -> attempt.markSucceeded(transactionKey));
    }

    /**
     * 토스 취소 실패. 예약 취소 자체는 계속 진행되므로 여기서 예외를 던지지 않는다.
     * 관리자가 이 행을 보고 수동 환불한다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void fail(Long cancelId, String failReason) {
        try {
            bgmAgitPaymentCancelRepository.findById(cancelId)
                    .ifPresent(attempt -> attempt.markFailed(failReason));
        } catch (RuntimeException e) {
            log.warn("[payment] 환불 실패 기록 중 오류. cancelId={}", cancelId, e);
        }
    }
}
