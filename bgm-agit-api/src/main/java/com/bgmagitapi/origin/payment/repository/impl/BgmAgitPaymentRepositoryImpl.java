package com.bgmagitapi.origin.payment.repository.impl;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.custom.BgmAgitPaymentCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import static com.bgmagitapi.origin.payment.entity.QBgmAgitPayment.bgmAgitPayment;

@RequiredArgsConstructor
public class BgmAgitPaymentRepositoryImpl implements BgmAgitPaymentCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<BgmAgitPayment> findLatestPaymentByReservationNoAndStatus(Long reservationNo, PaymentStatus status) {
        return Optional.ofNullable(
                queryFactory
                        .selectFrom(bgmAgitPayment)
                        .where(
                                bgmAgitPayment.bgmAgitReservationNo.eq(reservationNo),
                                bgmAgitPayment.bgmAgitPaymentStatus.eq(status)
                        )
                        .orderBy(bgmAgitPayment.bgmAgitPaymentId.desc())
                        .fetchFirst()
        );
    }
}
