package com.bgmagitapi.origin.clocktower.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGameResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitClockTowerGameService {

    /** source: OFFICIAL = 공식만, CUSTOM = 공식이 아닌 것, 그 외(null) = 전체 */
    Page<ClockTowerGameResponse> getGames(Pageable pageable, String keyword, String source);

    List<ClockTowerGameResponse> getSimpleGames();

    ClockTowerGameResponse getGame(Long id);

    ApiResponse createGame(ClockTowerGameCreateRequest request);

    ApiResponse modifyGame(Long id, ClockTowerGameModifyRequest request);

    ApiResponse deleteGame(Long id);
}
