package com.bgmagitapi.origin.payment.repository;

import com.bgmagitapi.origin.payment.entity.BgmAgitPaymentCancel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitPaymentCancelRepository extends JpaRepository<BgmAgitPaymentCancel, Long> {

    // 예약 단위 환불 이력 (관리자 응대용)
    List<BgmAgitPaymentCancel> findByBgmAgitReservationNoOrderByBgmAgitPaymentCancelIdAsc(Long reservationNo);
}
