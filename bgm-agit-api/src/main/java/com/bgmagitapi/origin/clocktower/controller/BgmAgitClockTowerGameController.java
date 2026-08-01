package com.bgmagitapi.origin.clocktower.controller;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGameResponse;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerGameService;
import com.bgmagitapi.origin.page.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitClockTowerGameController {

    private final BgmAgitClockTowerGameService bgmAgitClockTowerGameService;

    @GetMapping("/clocktower-games")
    public PageResponse<ClockTowerGameResponse> getGames(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(name = "keyword", required = false) String keyword) {
        return PageResponse.from(bgmAgitClockTowerGameService.getGames(pageable, keyword));
    }

    @GetMapping("/clocktower-games/simple")
    public List<ClockTowerGameResponse> getSimpleGames() {
        return bgmAgitClockTowerGameService.getSimpleGames();
    }

    @GetMapping("/clocktower-games/{id}")
    public ClockTowerGameResponse getGame(@PathVariable Long id) {
        return bgmAgitClockTowerGameService.getGame(id);
    }

    @PostMapping("/clocktower-games")
    public ApiResponse createGame(@Validated @ModelAttribute ClockTowerGameCreateRequest request) {
        return bgmAgitClockTowerGameService.createGame(request);
    }

    @PutMapping("/clocktower-games/{id}")
    public ApiResponse modifyGame(@PathVariable Long id,
                                  @Validated @ModelAttribute ClockTowerGameModifyRequest request) {
        return bgmAgitClockTowerGameService.modifyGame(id, request);
    }

    @DeleteMapping("/clocktower-games/{id}")
    public ApiResponse deleteGame(@PathVariable Long id) {
        return bgmAgitClockTowerGameService.deleteGame(id);
    }
}
