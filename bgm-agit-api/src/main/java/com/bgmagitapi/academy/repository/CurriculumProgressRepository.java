package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.repository.query.CurriculumProgressQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CurriculumProgressRepository extends JpaRepository<CurriculumProgress, Long>, CurriculumProgressQueryRepository {
    @Modifying
    @Query("delete from CurriculumProgress p where p.curriculum.id = :curriculumId")
    void deleteByCurriculumId(@Param("curriculumId") Long curriculumId);
    
    List<CurriculumProgress> findByCurriculum_Classes(String curriculumClasses);
}
