package com.bgmagitapi.origin.clocktower.repository;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.repository.custom.BgmAgitClockTowerGameCustomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BgmAgitClockTowerGameRepository extends JpaRepository<BgmAgitClockTowerGame, Long>,
        BgmAgitClockTowerGameCustomRepository {

    Page<BgmAgitClockTowerGame> findByUseStatusAndNameContaining(String useStatus, String name, Pageable pageable);

    /** 공식 스크립트만(목록 [공식] 필터) */
    Page<BgmAgitClockTowerGame> findByUseStatusAndSourceAndNameContaining(String useStatus, String source, String name, Pageable pageable);

    /** 공식이 아닌 것(커스텀 스크립트 + 직접 등록 + 출처 없는 옛 게임) — 목록 [커스텀] 필터 */
    @Query("select g from BgmAgitClockTowerGame g where g.useStatus = :useStatus and g.name like concat('%', :name, '%')"
            + " and (g.source is null or g.source <> 'OFFICIAL')")
    Page<BgmAgitClockTowerGame> findNonOfficial(@Param("useStatus") String useStatus, @Param("name") String name, Pageable pageable);

    List<BgmAgitClockTowerGame> findByUseStatusOrderByNameAsc(String useStatus);
}
