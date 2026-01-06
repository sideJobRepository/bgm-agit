package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.repository.query.CurriculumContQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurriculumContRepository extends JpaRepository<CurriculumCont, Long> , CurriculumContQueryRepository {
}
