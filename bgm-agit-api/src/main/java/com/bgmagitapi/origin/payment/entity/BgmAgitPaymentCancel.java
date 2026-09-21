package com.bgmagitapi.origin.payment.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentCancelStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 환불(취소) 시도 이력.
 *
 * 결제행의 CANCEL_AMOUNT 하나로는 "누적 얼마"만 남고 언제 왜 얼마를 돌려줬는지가 사라진다.
 * 부분환불이 여러 번 일어나는 구조(50% 환불 + 인원 축소 차액)에서는 그 이력이 곧 고객 응대 근거다.
 *
 * 더 중요한 이유는 멱등키다. 이 행을 토스 호출 **전에** 별도 트랜잭션으로 커밋해서 PK를 확보하고,
 * 그 값을 Idempotency-Key 로 보낸다. 타임아웃 재시도가 같은 키를 쓰면 토스가 중복 환불을 막아준다.
 */
@Entity
@Table(name = "BGM_AGIT_PAYMENT_CANCEL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitPaymentCancel extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_PAYMENT_CANCEL_ID")
    private Long bgmAgitPaymentCancelId;

    // 대상 결제 (물리 FK. 결제행은 이력이라 지우지 않는다)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_PAYMENT_ID")
    private BgmAgitPayment bgmAgitPayment;

    // 예약 그룹키 (결제행을 거치지 않고 예약 단위로 이력을 훑을 때 쓴다)
    @Column(name = "BGM_AGIT_RESERVATION_NO")
    private Long bgmAgitReservationNo;

    // 이번 시도에서 환불하려는 금액
    @Column(name = "BGM_AGIT_CANCEL_AMOUNT")
    private Integer bgmAgitCancelAmount;

    // 환불 비율(100/50/0). 어떤 규정 구간에서 나온 금액인지 남긴다
    @Column(name = "BGM_AGIT_CANCEL_RATE")
    private Integer bgmAgitCancelRate;

    @Column(name = "BGM_AGIT_CANCEL_REASON")
    private String bgmAgitCancelReason;

    @Column(name = "BGM_AGIT_CANCEL_STATUS")
    @Enumerated(EnumType.STRING)
    private PaymentCancelStatus bgmAgitCancelStatus;

    // 토스 취소 거래 키 (성공 시)
    @Column(name = "BGM_AGIT_CANCEL_TRANSACTION_KEY")
    private String bgmAgitCancelTransactionKey;

    // 실패 사유 (토스 code/message 원문)
    @Column(name = "BGM_AGIT_CANCEL_FAIL_REASON")
    private String bgmAgitCancelFailReason;

    private static final int FAIL_REASON_MAX_LENGTH = 500;

    public BgmAgitPaymentCancel(BgmAgitPayment payment, Long reservationNo, Integer amount,
                                Integer rate, String reason) {
        this.bgmAgitPayment = payment;
        this.bgmAgitReservationNo = reservationNo;
        this.bgmAgitCancelAmount = amount;
        this.bgmAgitCancelRate = rate;
        this.bgmAgitCancelReason = reason;
        this.bgmAgitCancelStatus = PaymentCancelStatus.REQUESTED;
    }

    /** 멱등키. 토스 Idempotency-Key 는 문자열이라 PK 를 접두어와 함께 쓴다. */
    public String idempotencyKey() {
        return "bgmagit_cancel_" + this.bgmAgitPaymentCancelId;
    }

    public void markSucceeded(String transactionKey) {
        this.bgmAgitCancelStatus = PaymentCancelStatus.DONE;
        this.bgmAgitCancelTransactionKey = transactionKey;
        this.bgmAgitCancelFailReason = null;
    }

    public void markFailed(String failReason) {
        this.bgmAgitCancelStatus = PaymentCancelStatus.FAILED;
        this.bgmAgitCancelFailReason = truncate(failReason);
    }

    private String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= FAIL_REASON_MAX_LENGTH
                ? value
                : value.substring(0, FAIL_REASON_MAX_LENGTH);
    }
}
