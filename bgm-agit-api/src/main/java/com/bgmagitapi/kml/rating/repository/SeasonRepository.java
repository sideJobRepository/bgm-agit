package com.bgmagitapi.kml.rating.repository;

import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeasonRepository extends JpaRepository<Season, Long> {

    // 상태별 시즌 목록 조회 (삭제되지 않은 것만)
    @Query("select s from Season s where s.progressStatus = :progressStatus and s.useStatus = 'Y'")
    List<Season> findAllByProgressStatus(@Param("progressStatus") SeasonProgressStatus progressStatus);

    // 시즌 목록 조회 (삭제되지 않은 것만)
    @Query("select s from Season s where s.useStatus = 'Y'")
    List<Season> findAllActive();

    // 삭제되지 않은 단건 조회
    @Query("select s from Season s where s.id = :id and s.useStatus = 'Y'")
    Optional<Season> findByIdActive(@Param("id") Long id);

    // 특정 상태의 시즌 존재 여부 (삭제되지 않은 것만)
    @Query("select case when count(s) > 0 then true else false end from Season s where s.progressStatus = :progressStatus and s.useStatus = 'Y'")
    boolean existsByProgressStatus(@Param("progressStatus") SeasonProgressStatus progressStatus);

}
