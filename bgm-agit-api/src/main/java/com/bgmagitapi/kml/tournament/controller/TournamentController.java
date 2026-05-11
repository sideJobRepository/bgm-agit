package com.bgmagitapi.kml.tournament.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.tournament.dto.request.TournamentPostRequest;
import com.bgmagitapi.kml.tournament.dto.response.TournamentArchiveResponse;
import com.bgmagitapi.kml.tournament.dto.response.TournamentLeaderboardResponse;
import com.bgmagitapi.kml.tournament.dto.response.TournamentResponse;
import com.bgmagitapi.kml.tournament.dto.response.TournamentSettingOptionResponse;
import com.bgmagitapi.kml.tournament.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping("/tournaments")
    public List<TournamentResponse> getTournaments() {
        return tournamentService.getTournaments();
    }

    @GetMapping("/tournaments/active")
    public TournamentResponse getActiveTournament() {
        return tournamentService.getActiveTournament();
    }

    @GetMapping("/tournaments/active/leaderboard")
    public TournamentLeaderboardResponse getActiveLeaderboard() {
        return tournamentService.getActiveLeaderboard();
    }

    @GetMapping("/tournaments/closed")
    public List<TournamentArchiveResponse> getClosedTournaments() {
        return tournamentService.getClosedTournaments();
    }

    @GetMapping("/tournaments/{tournamentId}/leaderboard")
    public TournamentLeaderboardResponse getLeaderboard(@PathVariable Long tournamentId) {
        return tournamentService.getLeaderboard(tournamentId);
    }

    @GetMapping("/tournaments/settings")
    public List<TournamentSettingOptionResponse> getTournamentSettings() {
        return tournamentService.getTournamentSettings();
    }

    @PostMapping("/tournaments")
    public ApiResponse createTournament(@Validated @RequestBody TournamentPostRequest request) {
        return tournamentService.createTournament(request);
    }

    @PutMapping("/tournaments/{tournamentId}")
    public ApiResponse updateTournament(
            @PathVariable Long tournamentId,
            @Validated @RequestBody TournamentPostRequest request
    ) {
        return tournamentService.updateTournament(tournamentId, request);
    }

    @PutMapping("/tournaments/{tournamentId}/start")
    public ApiResponse startTournament(@PathVariable Long tournamentId) {
        return tournamentService.startTournament(tournamentId);
    }

    @PutMapping("/tournaments/{tournamentId}/close")
    public ApiResponse closeTournament(@PathVariable Long tournamentId) {
        return tournamentService.closeTournament(tournamentId);
    }
}
