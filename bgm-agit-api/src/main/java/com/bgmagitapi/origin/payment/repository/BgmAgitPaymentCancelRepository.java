package com.bgmagitapi.origin.payment.repository;

import com.bgmagitapi.origin.payment.entity.BgmAgitPaymentCancel;
import com.bgmagitapi.origin.payment.repository.custom.BgmAgitPaymentCancelCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitPaymentCancelRepository extends JpaRepository<BgmAgitPaymentCancel, Long>, BgmAgitPaymentCancelCustomRepository {
}
