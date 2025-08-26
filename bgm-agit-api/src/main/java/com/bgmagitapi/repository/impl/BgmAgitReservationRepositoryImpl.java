package com.bgmagitapi.repository.impl;

import com.bgmagitapi.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.repository.costom.BgmAgitReservationCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.entity.QBgmAgitMember.*;
import static com.bgmagitapi.entity.QBgmAgitReservation.bgmAgitReservation;

@RequiredArgsConstructor
public class BgmAgitReservationRepositoryImpl implements BgmAgitReservationCustomRepository {
    
    private final JPAQueryFactory queryFactory;
    
    private final EntityManager em;
    
    @Override
    public List<ReservedTimeDto> findReservations(Long labelGb, String link, Long id, LocalDate today, LocalDate endOfYear) {
        return queryFactory
                .select(Projections.constructor(
                        ReservedTimeDto.class,
                        bgmAgitReservation.bgmAgitReservationStartDate,
                        bgmAgitReservation.bgmAgitReservationStartTime,
                        bgmAgitReservation.bgmAgitReservationEndTime,
                        bgmAgitImage.bgmAgitImageLabel,
                        bgmAgitImage.bgmAgitImageGroups,
                        bgmAgitReservation.bgmAgitReservationApprovalStatus,
                        bgmAgitReservation.bgmAgitMember.bgmAgitMemberId,
                        bgmAgitReservation.bgmAgitReservationCancelStatus
                ))
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage)
                .where(
                        bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb),
                        bgmAgitImage.bgmAgitMenuLink.eq(link),
                        bgmAgitImage.bgmAgitImageId.eq(id),
                        bgmAgitReservation.bgmAgitReservationApprovalStatus.in("Y", "N"), // 확정 포함
                        bgmAgitReservation.bgmAgitReservationStartDate.between(today, endOfYear)
                )
                .fetch();
    }
    
    @Override
    public List<BgmAgitReservation> findExistingReservations(BgmAgitImage image, LocalDate startDate, String cancelStatus) {
        return queryFactory
                .selectFrom(bgmAgitReservation)
                .where(
                        bgmAgitReservation.bgmAgitImage.eq(image),
                        bgmAgitReservation.bgmAgitReservationStartDate.eq(startDate),
                        bgmAgitReservation.bgmAgitReservationCancelStatus.eq(cancelStatus)
                )
                .fetch();
    
    }
    
    @Override
    public long updateCancelAndApprovalStatus(String cancelStatus, String approvalStatus, List<Long> idList) {
        em.flush();
        long execute = queryFactory
                .update(bgmAgitReservation)
                .set(bgmAgitReservation.bgmAgitReservationCancelStatus, cancelStatus)
                .set(bgmAgitReservation.bgmAgitReservationApprovalStatus, approvalStatus)
                .where(bgmAgitReservation.bgmAgitReservationId.in(idList))
                .execute();
        
        em.clear();
        return execute;
    }
    
    @Override
    public Long findMaxReservationNo() {
        return queryFactory
                .select(bgmAgitReservation.bgmAgitReservationNo.max())
                .from(bgmAgitReservation)
                .fetchOne();
    }
    
    @Override
    public List<BgmAgitReservation> findReservationsForDetail(Long memberId, boolean isUserRole, LocalDate start, LocalDate end, Pageable pageable) {
        return queryFactory
                .select(bgmAgitReservation)
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitMember, bgmAgitMember).fetchJoin()
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage).fetchJoin()
                .where(isUserFilter(memberId, isUserRole), dateBetween(start, end))
                .orderBy(bgmAgitReservation.bgmAgitReservationNo.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
    }
    
    @Override
    public JPAQuery<Long> countReservationsDistinctForDetail(Long memberId, boolean isUserRole, LocalDate start, LocalDate end) {
        return queryFactory
                .select(bgmAgitReservation.bgmAgitReservationNo.countDistinct())
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitMember, bgmAgitMember)
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage)
                .where(isUserFilter(memberId, isUserRole), dateBetween(start, end));
    }
    
    
    private BooleanExpression isUserFilter(Long memberId, boolean isUser) {
        return isUser ? bgmAgitReservation.bgmAgitMember.bgmAgitMemberId.eq(memberId) : null;
    }
    private BooleanExpression dateBetween(LocalDate start, LocalDate end) {
        if (start != null && end != null) return bgmAgitReservation.bgmAgitReservationStartDate.between(start, end);
        if (start != null) return bgmAgitReservation.bgmAgitReservationStartDate.goe(start);
        if (end != null) return bgmAgitReservation.bgmAgitReservationStartDate.loe(end);
        return null;
    }
}
