package com.bgmagitapi.clocktower.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.clocktower.dto.request.ClockTowerGameCreateRequest;
import com.bgmagitapi.clocktower.dto.request.ClockTowerGameModifyRequest;
import com.bgmagitapi.clocktower.dto.response.ClockTowerGameResponse;
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
