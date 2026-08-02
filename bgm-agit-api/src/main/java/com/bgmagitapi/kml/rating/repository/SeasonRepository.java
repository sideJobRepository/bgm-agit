package com.bgmagitapi.kml.rating.repository;

import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeasonRepository extends JpaRepository<Season, Long> {

    // 상태별 시즌 목록 조회
    List<Season> findAllByProgressStatus(SeasonProgressStatus progressStatus);

}
