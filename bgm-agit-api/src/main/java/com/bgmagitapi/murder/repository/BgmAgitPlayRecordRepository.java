package com.bgmagitapi.murder.repository;

import com.bgmagitapi.murder.entity.BgmAgitPlayRecord;
import com.bgmagitapi.murder.repository.query.PlayStatsQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitPlayRecordRepository extends JpaRepository<BgmAgitPlayRecord, Long>, PlayStatsQueryRepository {

    // 카탈로그 삭제 시 참조 여부 판단 (참조 있으면 soft delete)
    boolean existsByMurderGame_Id(Long gameId);
}
