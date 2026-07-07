package com.bgmagitapi.origin.lecture.repository.impl;

import com.bgmagitapi.origin.lecture.entity.Lecture;
import com.bgmagitapi.origin.lecture.repository.query.LectureQueryRepository;
import com.bgmagitapi.origin.my.dto.response.MyAcademyGetResponse;

import com.bgmagitapi.origin.my.dto.response.QMyAcademyGetResponse;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;

import java.time.LocalDate;
import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.*;
import static com.bgmagitapi.origin.lecture.entity.QLecture.lecture;
import static com.bgmagitapi.origin.slot.entity.QLectureSlot.lectureSlot;

@RequiredArgsConstructor
public class LectureRepositoryImpl implements LectureQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<Long> findByReservedSlotIds(LocalDate start, LocalDate end) {
        return queryFactory
                .select(lectureSlot.id)
                .from(lecture)
                .join(lecture.lectureSlot, lectureSlot)
                .where(lectureSlot.startDate.between(start, end)
                        , lecture.lectureCancelStatus.eq("N"))
                .fetch();
    }
    
    @Override
    public boolean existsMyActiveReservation(Long memberId, LocalDate today) {
        Integer exists = queryFactory
                .selectOne()
                .from(lecture)
                .join(lecture.lectureSlot, lectureSlot)
                .where(
                        lecture.member.bgmAgitMemberId.eq(memberId),
                        lecture.lectureCancelStatus.eq("N"),
                        lectureSlot.startDate.goe(today)
                )
                .fetchFirst();
        
        return exists != null;
    }
    
    @Override
    public Page<MyAcademyGetResponse> findByMyAcademy(Pageable pageable, Long memberId) {
        
        List<Long> longList = queryFactory
                .select(lecture.id)
                .from(lecture)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .where(memberIdEq(memberId))
                .orderBy(lecture.registDate.desc())
                .fetch();
        
        List<MyAcademyGetResponse> result = queryFactory
                .select(
                        new QMyAcademyGetResponse(
                                lecture.id,
                                bgmAgitMember.bgmAgitMemberId,
                                bgmAgitMember.bgmAgitMemberName,
                                lecture.lectureApprovalStatus,
                                lecture.lectureCancelStatus,
                                lectureSlot.startDate,
                                lectureSlot.startTime,
                                lectureSlot.endTime,
                                bgmAgitMember.bgmAgitMemberPhoneNo,
                                lecture.registDate
                        
                        )
                )
                .from(lecture)
                .join(lecture.lectureSlot, lectureSlot)
                .join(lecture.member, bgmAgitMember)
                .where(lecture.id.in(longList))
                .orderBy(lecture.registDate.desc())
                .fetch();
        
        JPAQuery<Long> countQuery = queryFactory
                .select(lecture.count())
                .from(lecture)
                .where(memberIdEq(memberId));
        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
    }
    
    @Override
    public Lecture findByLectureDate(Long lectureId) {
        return queryFactory
                .select(lecture)
                .from(lecture)
                .join(lecture.lectureSlot, lectureSlot)
                .where(lecture.id.eq(lectureId))
                .fetchFirst();
    }
    
    private BooleanExpression memberIdEq(Long memberId) {
            if (memberId == null) {
                return null;
            }
            return lecture.member.bgmAgitMemberId.eq(memberId);
        }
}
