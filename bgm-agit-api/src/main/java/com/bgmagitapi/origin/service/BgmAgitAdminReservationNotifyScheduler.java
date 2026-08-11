package com.bgmagitapi.origin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    // 발송 대상 환경 스위치. staging 과 운영이 같은 시각에 각자 보내면 하루 2번 발송되므로
    // 운영 프로필만 true 로 두고 나머지는 스케줄을 그냥 건너뛴다.
    @Value("${biztalk.admin-reservation-notify:false}")
    private boolean adminReservationNotifyEnabled;

    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    public void notifyTodayReservations() {
        LocalDate today = LocalDate.now(KST);
        if (!adminReservationNotifyEnabled) {
            log.info("[ALIMTALK] 관리자 당일 예약 알림 비활성 환경이라 건너뜀 date={}", today);
            return;
        }
        try {
            bgmAgitBizTalkSandService.sendAdminDailyReservation(today);
            log.info("[ALIMTALK] 관리자 당일 예약 알림 발송 완료 date={}", today);
        } catch (Exception e) {
            // 발송 실패가 다음 날 스케줄에 영향을 주지 않도록 삼키고 로깅만 한다
            log.warn("[ALIMTALK] 관리자 당일 예약 알림 발송 실패 date={}", today, e);
        }
    }
}
