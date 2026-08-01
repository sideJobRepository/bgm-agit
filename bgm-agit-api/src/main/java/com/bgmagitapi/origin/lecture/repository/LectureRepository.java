package com.bgmagitapi.origin.lecture.repository;

import com.bgmagitapi.origin.lecture.entity.Lecture;
import com.bgmagitapi.origin.lecture.repository.query.LectureQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureRepository extends JpaRepository<Lecture, Long>, LectureQueryRepository {
}
