package com.bgmagitapi.kml.tournament.scheduler;

import com.bgmagitapi.kml.tournament.service.TournamentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TournamentScheduler {

    private final TournamentService tournamentService;

    // 매 분 0초마다 active 대회 중 endDateTime이 지난 건 CLOSED로 자동 전환
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    public void closeExpired() {
        try {
            tournamentService.closeExpiredTournaments();
        } catch (Exception e) {
            log.warn("[Tournament] 자동 종료 스케줄러 오류 cause={}", e.toString());
        }
    }
}
