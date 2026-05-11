package com.bgmagitapi.kml.tournament.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.tournament.dto.request.TournamentPostRequest;
import com.bgmagitapi.kml.tournament.dto.response.TournamentArchiveResponse;
import com.bgmagitapi.kml.tournament.dto.response.TournamentLeaderboardResponse;
import com.bgmagitapi.kml.tournament.dto.response.TournamentResponse;
import com.bgmagitapi.kml.tournament.dto.response.TournamentSettingOptionResponse;

import java.util.List;

public interface TournamentService {

    List<TournamentResponse> getTournaments();

    TournamentResponse getActiveTournament();

    TournamentLeaderboardResponse getActiveLeaderboard();

    TournamentLeaderboardResponse getLeaderboard(Long tournamentId);

    List<TournamentArchiveResponse> getClosedTournaments();

    List<TournamentSettingOptionResponse> getTournamentSettings();

    ApiResponse createTournament(TournamentPostRequest request);

    ApiResponse updateTournament(Long tournamentId, TournamentPostRequest request);

    ApiResponse startTournament(Long tournamentId);

    ApiResponse closeTournament(Long tournamentId);

    int closeExpiredTournaments();
}
