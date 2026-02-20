package com.bgmagitapi.kml.slot.repository.impl;

import com.bgmagitapi.kml.slot.entity.LectureSlot;
import com.bgmagitapi.kml.slot.entity.QLectureSlot;
import com.bgmagitapi.kml.slot.repository.query.LectureSlotQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

import static com.bgmagitapi.kml.slot.entity.QLectureSlot.*;

@RequiredArgsConstructor
public class LectureSlotRepositoryImpl implements LectureSlotQueryRepository {

    private final JPAQueryFactory queryFactory;
    
    @Override
    public LectureSlot findByLectureTime(LocalDate date, LocalTime startTime, LocalTime endTime) {
        return queryFactory
                .selectFrom(lectureSlot)
                .where(lectureSlot.startDate.eq(date)
                        , lectureSlot.startTime.eq(startTime)
                    , lectureSlot.endTime.eq(endTime)
                    
                ).fetchFirst();
    }
    
    @Override
    public Boolean updateLectureSlotCapacity(Long id) {
        
        long execute = queryFactory
                .update(lectureSlot)
                .set(lectureSlot.approvalPeople, lectureSlot.approvalPeople.add(1))
                .where(lectureSlot.id.eq(id)
                        , lectureSlot.approvalPeople.lt(lectureSlot.capacity)
                )
                .execute();
        return  execute > 0;
    }
}
