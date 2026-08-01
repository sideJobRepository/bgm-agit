package com.bgmagitapi.origin.slot.repository;

import com.bgmagitapi.origin.slot.entity.LectureSlot;
import com.bgmagitapi.origin.slot.repository.query.LectureSlotQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureSlotRepository extends JpaRepository<LectureSlot, Long>, LectureSlotQueryRepository {
}
