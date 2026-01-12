package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.repository.query.CurriculumContQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CurriculumContRepository extends JpaRepository<CurriculumCont, Long> , CurriculumContQueryRepository {
    @Modifying
    @Query("delete from CurriculumCont c where c.curriculumProgress.curriculum.id = :curriculumId")
    void deleteByCurriculumId(@Param("curriculumId") Long curriculumId);
}
