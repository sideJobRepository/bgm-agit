package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.repository.query.CurriculumProgressQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurriculumProgressRepository extends JpaRepository<CurriculumProgress, Long>, CurriculumProgressQueryRepository {
}
