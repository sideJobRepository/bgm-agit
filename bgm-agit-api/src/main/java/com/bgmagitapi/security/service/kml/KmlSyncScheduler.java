package com.bgmagitapi.security.service.kml;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KmlSyncScheduler {

    private final KmlSyncService kmlSyncService;

    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    public void retryKmlSync() {
        try {
            kmlSyncService.retryAll();
        } catch (Exception e) {
            log.warn("[KML-SYNC] 스케줄러 실행 중 오류 cause={}", e.toString());
        }
    }
}
