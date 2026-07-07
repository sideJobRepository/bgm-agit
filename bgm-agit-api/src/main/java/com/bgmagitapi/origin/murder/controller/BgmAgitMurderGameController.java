package com.bgmagitapi.origin.murder.controller;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.murder.dto.request.MurderGameCreateRequest;
import com.bgmagitapi.origin.murder.dto.request.MurderGameModifyRequest;
import com.bgmagitapi.origin.murder.dto.response.MurderGameResponse;
import com.bgmagitapi.origin.murder.service.BgmAgitMurderGameService;
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
public class BgmAgitMurderGameController {

    private final BgmAgitMurderGameService bgmAgitMurderGameService;

    @GetMapping("/murder-games")
    public PageResponse<MurderGameResponse> getMurderGames(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(name = "keyword", required = false) String keyword) {
        return PageResponse.from(bgmAgitMurderGameService.getMurderGames(pageable, keyword));
    }

    // 플레이 기록 등록 화면 드롭다운용 경량 목록
    @GetMapping("/murder-games/simple")
    public List<MurderGameResponse> getSimpleGames() {
        return bgmAgitMurderGameService.getSimpleGames();
    }

    @GetMapping("/murder-games/{id}")
    public MurderGameResponse getMurderGame(@PathVariable Long id) {
        return bgmAgitMurderGameService.getMurderGame(id);
    }

    @PostMapping("/murder-games")
    public ApiResponse createMurderGame(@Validated @ModelAttribute MurderGameCreateRequest request) {
        return bgmAgitMurderGameService.createMurderGame(request);
    }

    @PutMapping("/murder-games/{id}")
    public ApiResponse modifyMurderGame(@PathVariable Long id,
                                        @Validated @ModelAttribute MurderGameModifyRequest request) {
        return bgmAgitMurderGameService.modifyMurderGame(id, request);
    }

    @DeleteMapping("/murder-games/{id}")
    public ApiResponse deleteMurderGame(@PathVariable Long id) {
        return bgmAgitMurderGameService.deleteMurderGame(id);
    }
}
