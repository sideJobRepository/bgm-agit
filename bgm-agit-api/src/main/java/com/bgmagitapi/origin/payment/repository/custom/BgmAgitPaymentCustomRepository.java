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
     * 결제까지 가지 않고 버려진 주문(READY) 정리.
     * 결제 버튼을 누를 때마다 주문행이 생기므로 대부분은 승인되지 않고 남는다.
     * DONE/CANCELED 는 결제 이력이라 절대 지우지 않는다.
     */
    long deleteAbandonedOrders(LocalDateTime createdBefore);

    // 예약번호별 최신 DONE 결제의 영수증 URL 배치 조회 (예약내역 리스트에 임베드, N+1 방지)
    Map<Long, String> findDoneReceiptUrlsByReservationNos(List<Long> reservationNos);
}
