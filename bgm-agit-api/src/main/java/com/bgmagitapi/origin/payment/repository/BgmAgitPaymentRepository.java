package com.bgmagitapi.origin.payment.repository;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BgmAgitPaymentRepository extends JpaRepository<BgmAgitPayment, Long> {

    // 토스 orderId로 결제 조회 (confirm 시 조회 키, UNIQUE)
    Optional<BgmAgitPayment> findByBgmAgitOrderNo(String bgmAgitOrderNo);

    // 예약 그룹의 결제 이력 조회 (재결제/환불 처리용)
    List<BgmAgitPayment> findByBgmAgitReservationNo(Long bgmAgitReservationNo);
}
