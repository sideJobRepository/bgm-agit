package com.bgmagitapi.origin.murder.repository;

import com.bgmagitapi.origin.murder.entity.BgmAgitMurderGame;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitMurderGameRepository extends JpaRepository<BgmAgitMurderGame, Long> {

    // 카탈로그 목록 (사용중 + 게임명 검색, 페이징)
    Page<BgmAgitMurderGame> findByUseStatusAndNameContaining(String useStatus, String name, Pageable pageable);

    // 드롭다운용 경량 목록
    List<BgmAgitMurderGame> findByUseStatusOrderByNameAsc(String useStatus);
}
