package com.bgmagitapi.origin.payment.repository.custom;

import com.bgmagitapi.origin.payment.entity.BgmAgitPaymentCancel;

import java.util.List;

public interface BgmAgitPaymentCancelCustomRepository {

    /** 예약 단위 환불 이력(등록 순). 관리자 응대용. */
    List<BgmAgitPaymentCancel> findCancelsByReservationId(Long reservationId);
}
