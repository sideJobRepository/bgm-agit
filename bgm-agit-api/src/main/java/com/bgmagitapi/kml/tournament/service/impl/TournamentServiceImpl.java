package com.bgmagitapi.kml.tournament.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.tournament.dto.request.TournamentPostRequest;
import com.bgmagitapi.kml.tournament.dto.response.TournamentResponse;
import com.bgmagitapi.kml.tournament.dto.response.TournamentSettingOptionResponse;
import com.bgmagitapi.kml.tournament.entity.Tournament;
import com.bgmagitapi.kml.tournament.enums.TournamentProgressStatus;
import com.bgmagitapi.kml.tournament.repository.TournamentRepository;
import com.bgmagitapi.kml.tournament.service.TournamentService;
import com.bgmagitapi.kml.tournament.dto.response.TournamentArchiveResponse;
import com.bgmagitapi.kml.tournament.dto.response.TournamentLeaderboardResponse;
import com.bgmagitapi.kml.tournament.repository.TournamentLeaderboardRepository;
import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;
import com.bgmagitapi.kml.tournamentsetting.repository.TournamentSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentSettingRepository tournamentSettingRepository;
    private final TournamentLeaderboardRepository tournamentLeaderboardRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TournamentResponse> getTournaments() {
        return tournamentRepository.findAllByOrderByStartDateDescIdDesc()
                .stream()
                .map(TournamentResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TournamentResponse getActiveTournament() {
        return tournamentRepository.findFirstByProgressStatus(TournamentProgressStatus.ACTIVE)
                .map(TournamentResponse::from)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public TournamentLeaderboardResponse getActiveLeaderboard() {
        Tournament active = tournamentRepository.findFirstByProgressStatus(TournamentProgressStatus.ACTIVE)
                .orElse(null);
        return active != null ? buildLeaderboard(active) : null;
    }

    @Override
    @Transactional(readOnly = true)
    public TournamentLeaderboardResponse getLeaderboard(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대회입니다."));
        return buildLeaderboard(tournament);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TournamentArchiveResponse> getClosedTournaments() {
        return tournamentRepository.findAllByProgressStatusOrderByEndDateDescIdDesc(TournamentProgressStatus.CLOSED)
                .stream()
                .map(t -> {
                    List<TournamentLeaderboardResponse.Entry> entries =
                            tournamentLeaderboardRepository.findLeaderboard(t.getId());
                    String winner = entries.isEmpty() ? null : entries.get(0).getNickName();
                    String settingName = t.getTournamentSetting() != null
                            ? TournamentSettingOptionResponse.from(t.getTournamentSetting()).getLabel()
                            : null;
                    return TournamentArchiveResponse.builder()
                            .tournamentId(t.getId())
                            .name(t.getName())
                            .startDate(t.getStartDate())
                            .endDate(t.getEndDate())
                            .startTime(t.getStartTime())
                            .endTime(t.getEndTime())
                            .tournamentSettingName(settingName)
                            .participantCount(entries.size())
                            .winnerNickName(winner)
                            .build();
                })
                .toList();
    }

    private TournamentLeaderboardResponse buildLeaderboard(Tournament tournament) {
        List<TournamentLeaderboardResponse.Entry> entries =
                tournamentLeaderboardRepository.findLeaderboard(tournament.getId());

        return TournamentLeaderboardResponse.builder()
                .tournamentId(tournament.getId())
                .tournamentName(tournament.getName())
                .startDate(tournament.getStartDate())
                .endDate(tournament.getEndDate())
                .startTime(tournament.getStartTime())
                .endTime(tournament.getEndTime())
                .progressStatus(tournament.getProgressStatus().name())
                .entries(entries)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TournamentSettingOptionResponse> getTournamentSettings() {
        return tournamentSettingRepository.findAll()
                .stream()
                .sorted(Comparator
                        .comparing((TournamentSetting setting) -> !"Y".equals(setting.getUseStatus()))
                        .thenComparing(TournamentSetting::getId, Comparator.reverseOrder()))
                .map(TournamentSettingOptionResponse::from)
                .toList();
    }

    @Override
    public ApiResponse createTournament(TournamentPostRequest request) {
        TournamentSetting setting = getSetting(request.getTournamentSettingId());

        Tournament tournament = Tournament.builder()
                .tournamentSetting(setting)
                .name(request.getName().trim())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .progressStatus(TournamentProgressStatus.READY)
                .build();

        tournamentRepository.save(tournament);
        return new ApiResponse(200, true, "대회가 저장되었습니다.");
    }

    @Override
    public ApiResponse updateTournament(Long tournamentId, TournamentPostRequest request) {
        Tournament tournament = getTournament(tournamentId);
        if (tournament.getProgressStatus() == TournamentProgressStatus.CLOSED) {
            throw new IllegalArgumentException("종료된 대회는 수정할 수 없습니다.");
        }

        tournament.update(
                getSetting(request.getTournamentSettingId()),
                request.getName().trim(),
                request.getStartDate(),
                request.getEndDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        return new ApiResponse(200, true, "대회가 수정되었습니다.");
    }

    @Override
    public ApiResponse startTournament(Long tournamentId) {
        Tournament tournament = getTournament(tournamentId);
        if (tournament.getProgressStatus() == TournamentProgressStatus.CLOSED) {
            throw new IllegalArgumentException("종료된 대회는 시작할 수 없습니다.");
        }
        if (tournament.getProgressStatus() == TournamentProgressStatus.ACTIVE) {
            return new ApiResponse(200, true, "이미 진행 중인 대회입니다.");
        }
        if (tournamentRepository.existsByProgressStatus(TournamentProgressStatus.ACTIVE)) {
            throw new IllegalArgumentException("이미 진행 중인 대회가 있습니다.");
        }

        tournament.start();
        return new ApiResponse(200, true, "대회가 시작되었습니다.");
    }

    @Override
    public ApiResponse closeTournament(Long tournamentId) {
        Tournament tournament = getTournament(tournamentId);
        if (tournament.getProgressStatus() == TournamentProgressStatus.CLOSED) {
            return new ApiResponse(200, true, "이미 종료된 대회입니다.");
        }

        tournament.close();
        return new ApiResponse(200, true, "대회가 종료되었습니다.");
    }

    @Override
    public int closeExpiredTournaments() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        List<Tournament> actives = tournamentRepository.findAllByProgressStatus(TournamentProgressStatus.ACTIVE);
        int closed = 0;
        for (Tournament tournament : actives) {
            LocalDate endDate = tournament.getEndDate();
            LocalTime endTime = tournament.getEndTime();
            if (endDate == null || endTime == null) continue;
            LocalDateTime end = LocalDateTime.of(endDate, endTime);
            if (now.isAfter(end)) {
                tournament.close();
                closed++;
                log.info("[Tournament] 자동 종료 — id={}, name={}, endedAt={}",
                        tournament.getId(), tournament.getName(), end);
            }
        }
        return closed;
    }

    private Tournament getTournament(Long tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대회입니다."));
    }

    private TournamentSetting getSetting(Long tournamentSettingId) {
        return tournamentSettingRepository.findById(tournamentSettingId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대회 설정입니다."));
    }
}
