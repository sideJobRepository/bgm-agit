package com.bgmagitapi.origin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 월간패스 초기화. 패스는 1일~말일 요금제라 매월 1일 0시에 전 회원을 'N' 으로 돌린다.
 * 다음 달 패스 회원은 관리자가 다시 켠다(권한관리 → 월간패스 탭).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BgmAgitMonthlyPassScheduler {

    private final BgmAgitRoleService bgmAgitRoleService;

    @Scheduled(cron = "0 0 0 1 * *", zone = "Asia/Seoul")
    public void resetMonthlyPass() {
        try {
            long count = bgmAgitRoleService.resetMonthlyPass();
            log.info("[MONTHLY-PASS] 월간패스 초기화 {}명", count);
        } catch (Exception e) {
            log.warn("[MONTHLY-PASS] 월간패스 초기화 중 오류 cause={}", e.toString());
        }
    }
}
