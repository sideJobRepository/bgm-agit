package com.bgmagitapi.security.service.kml;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * KML 미연동(matchsKmlId IS NULL) 대국 재전송 스케줄러.
 * 매시 30분 실행 — 회원 KML 연동 스케줄러(KmlSyncScheduler, 매시 정각)가 kmlId를 먼저 채운 뒤 돈다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KmlMatchsRetryScheduler {

    private final KmlMatchsRetryService kmlMatchsRetryService;

    @Scheduled(cron = "0 30 * * * *", zone = "Asia/Seoul")
    public void retryKmlSubmit() {
        try {
            kmlMatchsRetryService.retryAll();
        } catch (Exception e) {
            log.warn("[KML-MATCHS-RETRY] 스케줄러 실행 중 오류 cause={}", e.toString());
        }
    }
}
