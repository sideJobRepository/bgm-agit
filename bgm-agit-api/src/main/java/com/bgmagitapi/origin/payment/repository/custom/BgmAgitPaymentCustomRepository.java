package com.bgmagitapi.origin.payment.repository.custom;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BgmAgitPaymentCustomRepository {

    Optional<BgmAgitPayment> findLatestPaymentByReservationNoAndStatus(Long reservationNo, PaymentStatus status);

    /**
     * 예약 그룹에 정산된(DONE/PARTIAL_CANCELED/CANCELED) 결제가 하나라도 있는지.
     * 승인 진입부에서 중복 결제를 막는 데 쓴다 — 결제창을 두 개 띄워 둘 다 승인하면
     * 예전에는 orderNo 단위 멱등성만 있어서 두 번 과금됐다.
     */
    boolean existsSettledPaymentByReservationNo(Long reservationNo);

    /**
     * 환불할 잔액이 남은 결제 전부를 오래된 순으로. 행 잠금(PESSIMISTIC_WRITE)을 건다.
     *
     * 최신 1건만 보면(구 findLatest...) 재결제로 DONE 이 2건일 때 한쪽이 환불되지 않고,
     * 잠그지 않으면 동시 취소 두 건이 같은 잔액을 읽어 각각 환불한다.
     */
    List<BgmAgitPayment> findRefundablePaymentsForUpdate(Long reservationNo);

    /**
     * 결제까지 가지 않고 버려진 주문(READY) 정리.
     * 결제 버튼을 누를 때마다 주문행이 생기므로 대부분은 승인되지 않고 남는다.
     * DONE/CANCELED 는 결제 이력이라 절대 지우지 않는다.
     */
    long deleteAbandonedOrders(LocalDateTime createdBefore);

    /**
     * 오래된 결제 실패 이력(ABORTED) 정리.
     * 실패 사유는 원인 추적용이라 READY 보다 오래 남겨두고, 보존기간이 지난 것만 지운다.
     */
    long deleteOldAbortedOrders(LocalDateTime createdBefore);

    /** 예약의 살아있는 READY 주문을 전부 무효화(ABORTED)하고 건수를 반환. 인원이 바뀌면 옛 금액 주문은 못 쓴다. */
    long abortReadyOrders(Long reservationNo, String reason);

    // 예약번호별 최신 결제의 영수증 URL 배치 조회 (예약내역 리스트에 임베드, N+1 방지)
    Map<Long, String> findDoneReceiptUrlsByReservationNos(List<Long> reservationNos);

    /** 예약번호별 실제 결제 잔액(결제액 - 누적취소액) 배치 조회. 환불 예상액 표시에 쓴다. */
    Map<Long, Integer> findPaidAmountsByReservationNos(List<Long> reservationNos);
}
