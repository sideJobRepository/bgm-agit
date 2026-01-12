package com.bgmagitapi.academy.repository;

import com.bgmagitapi.academy.entity.Inputs;
import com.bgmagitapi.academy.repository.query.InputsQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InputsRepository extends JpaRepository<Inputs, Long> , InputsQueryRepository {
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update ProgressInputs pi
           set pi.curriculumProgress = null
         where pi.curriculumProgress.id in :progressIds
    """)
    void clearCurriculumProgress(@Param("progressIds") List<Long> progressIds);
}
