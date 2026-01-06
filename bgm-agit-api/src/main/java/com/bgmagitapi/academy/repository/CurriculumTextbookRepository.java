package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.CurriculumTextbook;
import com.bgmagitapi.academy.repository.query.CurriculumTextbookQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurriculumTextbookRepository extends JpaRepository<CurriculumTextbook, Long>, CurriculumTextbookQueryRepository {
}
