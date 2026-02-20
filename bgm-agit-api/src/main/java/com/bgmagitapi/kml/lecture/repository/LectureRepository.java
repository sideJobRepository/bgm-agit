package com.bgmagitapi.kml.lecture.repository;

import com.bgmagitapi.kml.lecture.entity.Lecture;
import com.bgmagitapi.kml.lecture.repository.query.LectureQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureRepository extends JpaRepository<Lecture, Long>, LectureQueryRepository {
}
