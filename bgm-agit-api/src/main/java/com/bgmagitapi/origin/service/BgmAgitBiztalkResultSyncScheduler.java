package com.bgmagitapi.origin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 비즈톡 발송 이력의 결과 코드를 주기적으로 갱신하는 스케줄러.
 * 발송 직후엔 결과가 PENDING 으로 저장되고, 여기서 5분마다 비즈톡 결과를 조회해 실제 코드로 갱신한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BgmAgitBiztalkResultSyncScheduler {

    private final BgmAgitBiztalkResultSyncService bgmAgitBiztalkResultSyncService;

    // 결과 조회는 운영만 한다. getResultAll 은 계정 결과 버퍼를 소비(비움)하는데 운영·스테이징이 같은 계정이라,
    // 스테이징이 돌면 운영 결과까지 가져가 버리고(자기 DB 에 없는 건 버림) 운영 이력이 PENDING 으로 남는다.
    @Value("${biztalk.result-sync-enabled:false}")
    private boolean resultSyncEnabled;

    @Scheduled(cron = "0 */5 * * * *", zone = "Asia/Seoul")
    public void syncBiztalkResults() {
        if (!resultSyncEnabled) return;
        try {
            bgmAgitBiztalkResultSyncService.syncRecentResults();
        } catch (Exception e) {
            log.warn("[BIZTALK-SYNC] 스케줄러 실행 중 오류 cause={}", e.toString());
        }
    }
}
