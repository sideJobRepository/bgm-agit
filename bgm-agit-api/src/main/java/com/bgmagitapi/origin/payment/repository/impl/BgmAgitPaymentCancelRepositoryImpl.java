package com.bgmagitapi.origin.payment.repository.impl;

import com.bgmagitapi.origin.payment.entity.BgmAgitPaymentCancel;
import com.bgmagitapi.origin.payment.repository.custom.BgmAgitPaymentCancelCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.origin.payment.entity.QBgmAgitPaymentCancel.bgmAgitPaymentCancel;

@RequiredArgsConstructor
public class BgmAgitPaymentCancelRepositoryImpl implements BgmAgitPaymentCancelCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<BgmAgitPaymentCancel> findCancelsByReservationId(Long reservationId) {
        return queryFactory
                .selectFrom(bgmAgitPaymentCancel)
                .where(bgmAgitPaymentCancel.bgmAgitReservationId.eq(reservationId))
                .orderBy(bgmAgitPaymentCancel.bgmAgitPaymentCancelId.asc())
                .fetch();
    }
}
