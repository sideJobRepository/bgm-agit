package com.bgmagitapi.origin.payment.repository.custom;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BgmAgitPaymentCustomRepository {

    Optional<BgmAgitPayment> findLatestPaymentByReservationNoAndStatus(Long reservationNo, PaymentStatus status);

    // 예약번호별 최신 DONE 결제의 영수증 URL 배치 조회 (예약내역 리스트에 임베드, N+1 방지)
    Map<Long, String> findDoneReceiptUrlsByReservationNos(List<Long> reservationNos);
}
