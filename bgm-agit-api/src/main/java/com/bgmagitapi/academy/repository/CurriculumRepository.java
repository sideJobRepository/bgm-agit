package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.Curriculum;
import com.bgmagitapi.academy.repository.query.CurriculumQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurriculumRepository extends JpaRepository<Curriculum, Long> , CurriculumQueryRepository {
}
