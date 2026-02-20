package com.bgmagitapi.kml.slot.repository;

import com.bgmagitapi.kml.slot.entity.LectureSlot;
import com.bgmagitapi.kml.slot.repository.query.LectureSlotQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureSlotRepository extends JpaRepository<LectureSlot, Long>, LectureSlotQueryRepository {
}
