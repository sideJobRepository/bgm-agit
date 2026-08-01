package com.bgmagitapi.origin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Scheduled(cron = "0 */5 * * * *", zone = "Asia/Seoul")
    public void syncBiztalkResults() {
        try {
            bgmAgitBiztalkResultSyncService.syncRecentResults();
        } catch (Exception e) {
            log.warn("[BIZTALK-SYNC] 스케줄러 실행 중 오류 cause={}", e.toString());
        }
    }
}
