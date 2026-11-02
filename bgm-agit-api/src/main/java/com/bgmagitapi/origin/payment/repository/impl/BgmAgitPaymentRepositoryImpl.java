package com.bgmagitapi.origin.payment.repository.impl;

import com.bgmagitapi.origin.payment.entity.BgmAgitPayment;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentKind;
import com.bgmagitapi.origin.payment.entity.enumeration.PaymentStatus;
import com.bgmagitapi.origin.payment.repository.custom.BgmAgitPaymentCustomRepository;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    public boolean existsSettledPaymentByReservationId(Long reservationId) {
        Integer hit = queryFactory
                .selectOne()
                .from(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitReservationId.eq(reservationId),
                        settled(),
                        // 원결제만 본다. 증원 추가결제(CHANGE)가 정산돼 있어도 원결제 중복 판정과는 무관하다.
                        // 컬럼이 생기기 전 결제는 null 이라 ORIGINAL 로 친다
                        bgmAgitPayment.bgmAgitPaymentKind.isNull()
                                .or(bgmAgitPayment.bgmAgitPaymentKind.eq(PaymentKind.ORIGINAL))
                )
                .fetchFirst();
        return hit != null;
    }

    @Override
    public boolean existsSettledPaymentByChangeId(Long changeId) {
        if (changeId == null) {
            return false;
        }
        Integer hit = queryFactory
                .selectOne()
                .from(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitReservationChangeId.eq(changeId),
                        settled()
                )
                .fetchFirst();
        return hit != null;
    }

    @Override
    public List<BgmAgitPayment> findRefundablePaymentsForUpdate(Long reservationId) {
        return queryFactory
                .selectFrom(bgmAgitPayment)
                .where(
                        bgmAgitPayment.bgmAgitReservationId.eq(reservationId),
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
    public long abortReadyOrders(Long reservationId, String reason) {
        return queryFactory
                .update(bgmAgitPayment)
                .set(bgmAgitPayment.bgmAgitPaymentStatus, PaymentStatus.ABORTED)
                .set(bgmAgitPayment.bgmAgitPaymentFailReason, reason)
                .where(
                        bgmAgitPayment.bgmAgitReservationId.eq(reservationId),
                        bgmAgitPayment.bgmAgitPaymentStatus.eq(PaymentStatus.READY)
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
                        settled(),
                        bgmAgitPayment.bgmAgitReservationId.in(reservationIds)
                )
                .orderBy(bgmAgitPayment.bgmAgitPaymentId.asc())
                .fetch();

        // id 오름차순이라 예약별 첫 값이 원결제다. 증원 추가결제(CHANGE)가 생긴 뒤에도
        // 대표 영수증은 원결제여야 하므로 최신이 아니라 가장 오래된 정산 결제를 고른다
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

    @Override
    public Map<Long, List<String>> findSettledReceiptUrlListsByReservationIds(List<Long> reservationIds) {
        Map<Long, List<String>> result = new LinkedHashMap<>();
        if (reservationIds == null || reservationIds.isEmpty()) {
            return result;
        }

        List<Tuple> rows = queryFactory
                .select(bgmAgitPayment.bgmAgitReservationId, bgmAgitPayment.bgmAgitPaymentReceiptUrl)
                .from(bgmAgitPayment)
                .where(
                        settled(),
                        bgmAgitPayment.bgmAgitReservationId.in(reservationIds)
                )
                .orderBy(bgmAgitPayment.bgmAgitPaymentId.asc())
                .fetch();

        for (Tuple row : rows) {
            Long reservationId = row.get(bgmAgitPayment.bgmAgitReservationId);
            String receiptUrl = row.get(bgmAgitPayment.bgmAgitPaymentReceiptUrl);
            if (reservationId == null || receiptUrl == null) {
                continue;
            }
            result.computeIfAbsent(reservationId, key -> new ArrayList<>()).add(receiptUrl);
        }
        return result;
    }

    @Override
    public Map<Long, Integer> findPaidAmountsByReservationIds(List<Long> reservationIds) {
        Map<Long, Integer> result = new LinkedHashMap<>();
        if (reservationIds == null || reservationIds.isEmpty()) {
            return result;
        }

        List<Tuple> rows = queryFactory
                .select(bgmAgitPayment.bgmAgitReservationId,
                        bgmAgitPayment.bgmAgitPaymentAmount,
                        bgmAgitPayment.bgmAgitCancelAmount)
                .from(bgmAgitPayment)
                .where(
                        settled(),
                        bgmAgitPayment.bgmAgitReservationId.in(reservationIds)
                )
                .fetch();

        // 재결제로 정산 결제가 여러 건일 수 있다. 환불 대상도 전부를 순회하므로 여기서도 합산한다
        for (Tuple row : rows) {
            Long reservationId = row.get(bgmAgitPayment.bgmAgitReservationId);
            if (reservationId == null) {
                continue;
            }
            Integer amount = row.get(bgmAgitPayment.bgmAgitPaymentAmount);
            Integer canceled = row.get(bgmAgitPayment.bgmAgitCancelAmount);
            int remaining = (amount == null ? 0 : amount) - (canceled == null ? 0 : canceled);
            result.merge(reservationId, Math.max(remaining, 0), Integer::sum);
        }
        return result;
    }

    @Override
    public Map<Long, Integer> findUnitPricesByReservationIds(List<Long> reservationIds) {
        Map<Long, Integer> result = new LinkedHashMap<>();
        if (reservationIds == null || reservationIds.isEmpty()) {
            return result;
        }

        List<Tuple> rows = queryFactory
                .select(bgmAgitPayment.bgmAgitReservationId,
                        bgmAgitPayment.bgmAgitPaymentUnitPrice)
                .from(bgmAgitPayment)
                .where(
                        settled(),
                        bgmAgitPayment.bgmAgitReservationId.in(reservationIds),
                        bgmAgitPayment.bgmAgitPaymentUnitPrice.isNotNull()
                )
                // 원결제 단가가 기준이다(추가결제도 같은 단가를 박지만 순서를 고정해 둔다)
                .orderBy(bgmAgitPayment.bgmAgitPaymentId.asc())
                .fetch();

        // 환불 쪽(refundPeopleReduction)도 정산 결제 중 단가가 있는 첫 값을 쓴다
        for (Tuple row : rows) {
            Long reservationId = row.get(bgmAgitPayment.bgmAgitReservationId);
            if (reservationId != null) {
                result.putIfAbsent(reservationId, row.get(bgmAgitPayment.bgmAgitPaymentUnitPrice));
            }
        }
        return result;
    }
}
