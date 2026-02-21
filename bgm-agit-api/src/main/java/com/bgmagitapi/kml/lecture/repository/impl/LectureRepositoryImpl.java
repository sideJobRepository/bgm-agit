package com.bgmagitapi.kml.lecture.repository.impl;

import com.bgmagitapi.kml.lecture.repository.query.LectureQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import static com.bgmagitapi.kml.lecture.entity.QLecture.lecture;
import static com.bgmagitapi.kml.slot.entity.QLectureSlot.lectureSlot;

@RequiredArgsConstructor
public class LectureRepositoryImpl implements LectureQueryRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<Long> findByReservedSlotIds(LocalDate start, LocalDate end) {
        return queryFactory
                .select(lectureSlot.id)
                .from(lecture)
                .join(lecture.lectureSlot,lectureSlot)
                .where(     lectureSlot.startDate.between(start, end)
                    ,lecture.lectureCancelStatus.eq("N"))
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
}
