package com.bgmagitapi.murder.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.murder.dto.request.MurderGameCreateRequest;
import com.bgmagitapi.murder.dto.request.MurderGameModifyRequest;
import com.bgmagitapi.murder.dto.response.MurderGameResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitMurderGameService {

    Page<MurderGameResponse> getMurderGames(Pageable pageable, String keyword);

    List<MurderGameResponse> getSimpleGames();

    MurderGameResponse getMurderGame(Long id);

    ApiResponse createMurderGame(MurderGameCreateRequest request);

    ApiResponse modifyMurderGame(Long id, MurderGameModifyRequest request);

    ApiResponse deleteMurderGame(Long id);
}
