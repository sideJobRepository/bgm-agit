package com.bgmagitapi.kml.rating.repository;

import com.bgmagitapi.kml.rating.entity.Tier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TierRepository extends JpaRepository<Tier, Long> {

    // 특정 시즌의 등급 목록을 최소 레이팅 내림차순으로 조회
    List<Tier> findBySeasonIdOrderByMinRatingDesc(Long seasonId);

    // 특정 시즌의 등급 전체 삭제 (덮어쓰기 저장 시 사용)
    void deleteBySeasonId(Long seasonId);
}
