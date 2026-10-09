package com.bgmagitapi.origin.payment.repository.impl;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.custom.BgmAgitPaymentCustomRepository;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.bgmagitapi.origin.payment.entity.QBgmAgitPayment.bgmAgitPayment;

@RequiredArgsConstructor
public class BgmAgitPaymentRepositoryImpl implements BgmAgitPaymentCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<BgmAgitPayment> findLatestPaymentByReservationIdAndStatus(Long reservationId, PaymentStatus status) {
        return Optional.ofNullable(
                queryFactory
                        .selectFrom(bgmAgitPayment)
                        .where(
                                bgmAgitPayment.bgmAgitReservationId.eq(reservationId),
                                bgmAgitPayment.bgmAgitPaymentStatus.eq(status)
                        )
                        .orderBy(bgmAgitPayment.bgmAgitPaymentId.desc())
                        .fetchFirst()
        );
    }

    @Override
    public long deleteAbandonedOrders(LocalDateTime createdBefore) {
        return queryFactory
                .delete(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitPaymentStatus.eq(PaymentStatus.READY),
                        bgmAgitPayment.registDate.lt(createdBefore)
                )
                .execute();
    }

    @Override
    public long deleteOldAbortedOrders(LocalDateTime createdBefore) {
        return queryFactory
                .delete(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitPaymentStatus.eq(PaymentStatus.ABORTED),
                        bgmAgitPayment.registDate.lt(createdBefore)
                )
                .execute();
    }

    @Override
    public Map<Long, String> findDoneReceiptUrlsByReservationIds(List<Long> reservationIds) {
        Map<Long, String> result = new LinkedHashMap<>();
        if (reservationIds == null || reservationIds.isEmpty()) {
            return result;
        }

        List<Tuple> rows = queryFactory
                .select(bgmAgitPayment.bgmAgitReservationId, bgmAgitPayment.bgmAgitPaymentReceiptUrl)
                .from(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitPaymentStatus.eq(PaymentStatus.DONE),
                        bgmAgitPayment.bgmAgitReservationId.in(reservationIds)
                )
                .orderBy(bgmAgitPayment.bgmAgitPaymentId.desc())
                .fetch();

        // id 내림차순이라 예약별 첫 값이 최신 결제 (재결제로 여러 건일 때 최신 우선)
        for (Tuple row : rows) {
            Long reservationId = row.get(bgmAgitPayment.bgmAgitReservationId);
            String receiptUrl = row.get(bgmAgitPayment.bgmAgitPaymentReceiptUrl);
            if (reservationId == null || receiptUrl == null) {
                continue;
            }
            result.putIfAbsent(reservationId, receiptUrl);
        }
        return result;
    }
}
