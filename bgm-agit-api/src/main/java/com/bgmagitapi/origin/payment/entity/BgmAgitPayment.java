package com.bgmagitapi.origin.payment.entity;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    private java.time.LocalDateTime bgmAgitPaymentApprovalDate;

    // BGM 아지트 결제 취소 일시
    @Column(name = "BGM_AGIT_PAYMENT_CANCEL_DATE")
    private java.time.LocalDateTime bgmAgitPaymentCancelDate;

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

    // 주문 생성용 생성자 (READY 상태로 저장)
    public BgmAgitPayment(BgmAgitMember member, Long reservationNo, String orderNo, Integer amount) {
        this.bgmAgitMember = member;
        this.bgmAgitReservationNo = reservationNo;
        this.bgmAgitOrderNo = orderNo;
        this.bgmAgitPaymentAmount = amount;
        this.bgmAgitPaymentStatus = PaymentStatus.READY;
    }

    // 상태 변경 도메인 메서드(markDone/markCanceled/markAborted)는 STEP 2 승인 단계에서 추가
}
