package com.bgmagitapi.origin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 매일 09:00(KST) 관리자에게 당일 예약 현황 알림톡 발송.
 * 예약이 0건이어도 "없음"으로 채워 매일 보낸다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BgmAgitAdminReservationNotifyScheduler {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private final BgmAgitBizTalkSandService bgmAgitBizTalkSandService;

    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    public void notifyTodayReservations() {
        LocalDate today = LocalDate.now(KST);
        try {
            bgmAgitBizTalkSandService.sendAdminDailyReservation(today);
            log.info("[ALIMTALK] 관리자 당일 예약 알림 발송 완료 date={}", today);
        } catch (Exception e) {
            // 발송 실패가 다음 날 스케줄에 영향을 주지 않도록 삼키고 로깅만 한다
            log.warn("[ALIMTALK] 관리자 당일 예약 알림 발송 실패 date={}", today, e);
        }
    }
}
