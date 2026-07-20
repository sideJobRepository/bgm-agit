package com.bgmagitapi.origin.payment.repository.impl;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.custom.BgmAgitPaymentCustomRepository;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    @Override
    public Map<Long, String> findDoneReceiptUrlsByReservationNos(List<Long> reservationNos) {
        Map<Long, String> result = new LinkedHashMap<>();
        if (reservationNos == null || reservationNos.isEmpty()) {
            return result;
        }

        List<Tuple> rows = queryFactory
                .select(bgmAgitPayment.bgmAgitReservationNo, bgmAgitPayment.bgmAgitPaymentReceiptUrl)
                .from(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitPaymentStatus.eq(PaymentStatus.DONE),
                        bgmAgitPayment.bgmAgitReservationNo.in(reservationNos)
                )
                .orderBy(bgmAgitPayment.bgmAgitPaymentId.desc())
                .fetch();

        // id 내림차순이라 예약번호별 첫 값이 최신 결제 (재결제로 여러 건일 때 최신 우선)
        for (Tuple row : rows) {
            Long reservationNo = row.get(bgmAgitPayment.bgmAgitReservationNo);
            String receiptUrl = row.get(bgmAgitPayment.bgmAgitPaymentReceiptUrl);
            if (reservationNo == null || receiptUrl == null) {
                continue;
            }
            result.putIfAbsent(reservationNo, receiptUrl);
        }
        return result;
    }
}
