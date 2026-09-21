package com.bgmagitapi.origin.payment.repository.impl;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.custom.BgmAgitPaymentCustomRepository;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.bgmagitapi.origin.payment.entity.QBgmAgitPayment.bgmAgitPayment;

@RequiredArgsConstructor
public class BgmAgitPaymentRepositoryImpl implements BgmAgitPaymentCustomRepository {

    private final JPAQueryFactory queryFactory;

    /**
     * 돈이 들어온 결제만 고르는 술어.
     *
     * 영수증 조회와 환불 대상 조회가 이 하나를 공유해야 한다. 예전처럼 각자 DONE 만 보면
     * 부분환불(PARTIAL_CANCELED)이 생기는 순간 영수증이 사라지고 잔액이 환불 대상에서 빠진다.
     */
    private static BooleanExpression settled() {
        return bgmAgitPayment.bgmAgitPaymentStatus.in(
                Arrays.stream(PaymentStatus.values()).filter(PaymentStatus::isSettled).toList());
    }

    private static BooleanExpression refundable() {
        return bgmAgitPayment.bgmAgitPaymentStatus.in(
                Arrays.stream(PaymentStatus.values()).filter(PaymentStatus::isRefundable).toList());
    }

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
    public boolean existsSettledPaymentByReservationNo(Long reservationNo) {
        Integer hit = queryFactory
                .selectOne()
                .from(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitReservationNo.eq(reservationNo),
                        settled()
                )
                .fetchFirst();
        return hit != null;
    }

    @Override
    public List<BgmAgitPayment> findRefundablePaymentsForUpdate(Long reservationNo) {
        return queryFactory
                .selectFrom(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitReservationNo.eq(reservationNo),
                        refundable()
                )
                .orderBy(bgmAgitPayment.bgmAgitPaymentId.asc())
                .setLockMode(LockModeType.PESSIMISTIC_WRITE)
                .fetch();
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
    public long abortReadyOrders(Long reservationNo, String reason) {
        return queryFactory
                .update(bgmAgitPayment)
                .set(bgmAgitPayment.bgmAgitPaymentStatus, PaymentStatus.ABORTED)
                .set(bgmAgitPayment.bgmAgitPaymentFailReason, reason)
                .where(
                        bgmAgitPayment.bgmAgitReservationNo.eq(reservationNo),
                        bgmAgitPayment.bgmAgitPaymentStatus.eq(PaymentStatus.READY)
                )
                .execute();
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
                        settled(),
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

    @Override
    public Map<Long, Integer> findPaidAmountsByReservationNos(List<Long> reservationNos) {
        Map<Long, Integer> result = new LinkedHashMap<>();
        if (reservationNos == null || reservationNos.isEmpty()) {
            return result;
        }

        List<Tuple> rows = queryFactory
                .select(bgmAgitPayment.bgmAgitReservationNo,
                        bgmAgitPayment.bgmAgitPaymentAmount,
                        bgmAgitPayment.bgmAgitCancelAmount)
                .from(bgmAgitPayment)
                .where(
                        settled(),
                        bgmAgitPayment.bgmAgitReservationNo.in(reservationNos)
                )
                .fetch();

        // 재결제로 정산 결제가 여러 건일 수 있다. 환불 대상도 전부를 순회하므로 여기서도 합산한다
        for (Tuple row : rows) {
            Long reservationNo = row.get(bgmAgitPayment.bgmAgitReservationNo);
            if (reservationNo == null) {
                continue;
            }
            Integer amount = row.get(bgmAgitPayment.bgmAgitPaymentAmount);
            Integer canceled = row.get(bgmAgitPayment.bgmAgitCancelAmount);
            int remaining = (amount == null ? 0 : amount) - (canceled == null ? 0 : canceled);
            result.merge(reservationNo, Math.max(remaining, 0), Integer::sum);
        }
        return result;
    }
}
