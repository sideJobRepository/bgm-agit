package com.bgmagitapi.origin.payment.entity;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "BGM_AGIT_PAYMENT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitPayment extends DateSuperClass {

    // BGM 아지트 결제 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_PAYMENT_ID")
    private Long bgmAgitPaymentId;

    // BGM 아지트 회원 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    // BGM 아지트 예약 번호 (예약 그룹키. 논리 연결이라 물리 FK 없음)
    @Column(name = "BGM_AGIT_RESERVATION_NO")
    private Long bgmAgitReservationNo;

    // BGM 아지트 주문 번호 (토스 orderId, 서버 발급, UNIQUE)
    @Column(name = "BGM_AGIT_ORDER_NO")
    private String bgmAgitOrderNo;

    // BGM 아지트 결제 키 (토스 paymentKey)
    @Column(name = "BGM_AGIT_PAYMENT_KEY")
    private String bgmAgitPaymentKey;

    // BGM 아지트 결제 금액
    @Column(name = "BGM_AGIT_PAYMENT_AMOUNT")
    private Integer bgmAgitPaymentAmount;

    // BGM 아지트 결제 상태 (READY/DONE/CANCELED/ABORTED)
    @Column(name = "BGM_AGIT_PAYMENT_STATUS")
    @Enumerated(EnumType.STRING)
    private PaymentStatus bgmAgitPaymentStatus;

    // BGM 아지트 결제 타입 (토스 method: 카드/간편결제/계좌이체 등)
    @Column(name = "BGM_AGIT_PAYMENT_TYPE")
    private String bgmAgitPaymentType;

    // BGM 아지트 결제 승인 일시
    @Column(name = "BGM_AGIT_PAYMENT_APPROVAL_DATE")
    private LocalDateTime bgmAgitPaymentApprovalDate;

    // BGM 아지트 결제 취소 일시
    @Column(name = "BGM_AGIT_PAYMENT_CANCEL_DATE")
    private LocalDateTime bgmAgitPaymentCancelDate;

    // BGM 아지트 취소 금액
    @Column(name = "BGM_AGIT_CANCEL_AMOUNT")
    private Integer bgmAgitCancelAmount;

    // BGM 아지트 취소 사유
    @Column(name = "BGM_AGIT_CANCEL_REASON")
    private String bgmAgitCancelReason;

    // BGM 아지트 결제 영수증 URL
    @Column(name = "BGM_AGIT_PAYMENT_RECEIPT_URL")
    private String bgmAgitPaymentReceiptUrl;

    // BGM 아지트 결제 실패 사유
    @Column(name = "BGM_AGIT_PAYMENT_FAIL_REASON")
    private String bgmAgitPaymentFailReason;

    /**
     * 주문 생성 시점의 예약 인원 스냅샷.
     * 예약의 인원은 뒤에 바뀔 수 있어서, 환불액을 "지금 인원"으로 재계산하면 결제액과 어긋난다.
     */
    @Column(name = "BGM_AGIT_PAYMENT_PEOPLE")
    private Integer bgmAgitPaymentPeople;

    /** 주문 생성 시점의 1인 단가 스냅샷. 인원 축소 환불의 차액 계산 기준. 마작 대탁(정액)이면 null. */
    @Column(name = "BGM_AGIT_PAYMENT_UNIT_PRICE")
    private Integer bgmAgitPaymentUnitPrice;

    // 주문 생성용 생성자 (READY 상태로 저장)
    public BgmAgitPayment(BgmAgitMember member, Long reservationNo, String orderNo, Integer amount,
                          Integer people, Integer unitPrice) {
        this.bgmAgitMember = member;
        this.bgmAgitReservationNo = reservationNo;
        this.bgmAgitOrderNo = orderNo;
        this.bgmAgitPaymentAmount = amount;
        this.bgmAgitPaymentPeople = people;
        this.bgmAgitPaymentUnitPrice = unitPrice;
        this.bgmAgitPaymentStatus = PaymentStatus.READY;
    }

    // 상태 변경 도메인 메서드(markDone/markCanceled/markAborted)는 STEP 2 승인 단계에서 추가
    public boolean isDone() {
        return PaymentStatus.DONE.equals(this.bgmAgitPaymentStatus);
    }

    public void markDone(String paymentKey, String method, LocalDateTime approvedAt, String receiptUrl) {
        this.bgmAgitPaymentKey = paymentKey;
        this.bgmAgitPaymentType = method;
        this.bgmAgitPaymentApprovalDate = approvedAt;
        this.bgmAgitPaymentReceiptUrl = receiptUrl;
        this.bgmAgitPaymentStatus = PaymentStatus.DONE;
        this.bgmAgitPaymentFailReason = null;
    }

    /** 아직 환불할 수 있는 잔액. 취소 요청 금액은 항상 이 값으로 클램프한다. */
    public int remainingAmount() {
        int paid = this.bgmAgitPaymentAmount == null ? 0 : this.bgmAgitPaymentAmount;
        int canceled = this.bgmAgitCancelAmount == null ? 0 : this.bgmAgitCancelAmount;
        return Math.max(paid - canceled, 0);
    }

    public boolean isRefundable() {
        return this.bgmAgitPaymentStatus != null
                && this.bgmAgitPaymentStatus.isRefundable()
                && remainingAmount() > 0;
    }

    /**
     * 취소 결과 반영. 누적 취소액과 상태는 토스 원장(totalAmount - balanceAmount)을 그대로 따른다.
     *
     * 로컬에서 더하면 재시도·부분취소가 겹쳤을 때 토스와 갈린다. 그래서 canceledAmount 는
     * 응답에서 계산한 누적값을 받고, 잔액이 남아 있으면 PARTIAL_CANCELED 로 둔다.
     */
    public void markCanceled(Integer canceledAmount, String cancelReason, LocalDateTime canceledAt) {
        int paid = this.bgmAgitPaymentAmount == null ? 0 : this.bgmAgitPaymentAmount;
        int accumulated = canceledAmount == null ? paid : canceledAmount;
        this.bgmAgitCancelAmount = accumulated;
        this.bgmAgitCancelReason = cancelReason;
        this.bgmAgitPaymentCancelDate = canceledAt;
        this.bgmAgitPaymentStatus = accumulated >= paid
                ? PaymentStatus.CANCELED
                : PaymentStatus.PARTIAL_CANCELED;
    }

    public void markAborted(String failReason) {
        this.bgmAgitPaymentStatus = PaymentStatus.ABORTED;
        this.bgmAgitPaymentFailReason = failReason;
    }
}
