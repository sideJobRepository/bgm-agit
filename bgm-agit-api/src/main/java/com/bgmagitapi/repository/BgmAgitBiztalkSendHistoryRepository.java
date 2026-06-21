package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitBiztalkSendHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BgmAgitBiztalkSendHistoryRepository extends JpaRepository<BgmAgitBiztalkSendHistory,Long> {

    // 최근 윈도우 내 결과 코드 미확정(PENDING) 이력 조회 - 스케줄러 결과 갱신용
    List<BgmAgitBiztalkSendHistory> findByBgmAgitBiztalkSendHistoryResultCodeAndRegistDateAfter(String bgmAgitBiztalkSendHistoryResultCode, LocalDateTime registDate);
}
