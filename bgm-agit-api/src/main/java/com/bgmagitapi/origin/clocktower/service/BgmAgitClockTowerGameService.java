package com.bgmagitapi.origin.clocktower.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGameResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitClockTowerGameService {

    Page<ClockTowerGameResponse> getGames(Pageable pageable, String keyword);

    List<ClockTowerGameResponse> getSimpleGames();

    ClockTowerGameResponse getGame(Long id);

    ApiResponse createGame(ClockTowerGameCreateRequest request);

    ApiResponse modifyGame(Long id, ClockTowerGameModifyRequest request);

    ApiResponse deleteGame(Long id);
}
