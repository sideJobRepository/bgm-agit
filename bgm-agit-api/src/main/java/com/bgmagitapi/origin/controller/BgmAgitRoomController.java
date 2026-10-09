package com.bgmagitapi.origin.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitRoomCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitRoomModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitRoomResponse;
import com.bgmagitapi.origin.service.BgmAgitRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitRoomController {

    private final BgmAgitRoomService bgmAgitRoomService;

    // 공개 조회. includeHidden 은 관리자일 때만 반영(서비스단 검사)
    @GetMapping("/rooms")
    public List<BgmAgitRoomResponse> getRooms(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "link", required = false) String link,
            @RequestParam(name = "includeHidden", defaultValue = "false") boolean includeHidden) {
        return bgmAgitRoomService.getRooms(link, includeHidden, extractRoles(jwt));
    }

    // =========================== 관리자 방 관리 ===========================
    // URL_RESOURCES 에 매핑이 없으면 기본 통과라 여기서 직접 막는다(URL 매핑도 같이 넣을 것)

    @PostMapping("/rooms")
    public ApiResponse createRoom(@AuthenticationPrincipal Jwt jwt,
                                  @Validated @ModelAttribute BgmAgitRoomCreateRequest request) {
        requireAdmin(jwt);
        return bgmAgitRoomService.createRoom(request);
    }

    @PutMapping("/rooms")
    public ApiResponse modifyRoom(@AuthenticationPrincipal Jwt jwt,
                                  @Validated @ModelAttribute BgmAgitRoomModifyRequest request) {
        requireAdmin(jwt);
        return bgmAgitRoomService.modifyRoom(request);
    }

    @DeleteMapping("/rooms/{roomId}")
    public ApiResponse deleteRoom(@AuthenticationPrincipal Jwt jwt, @PathVariable Long roomId) {
        requireAdmin(jwt);
        return bgmAgitRoomService.deleteRoom(roomId);
    }

    private void requireAdmin(Jwt jwt) {
        List<String> roles = extractRoles(jwt);
        if (!(roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"))) {
            throw new ForbiddenException("관리자만 사용할 수 있습니다.");
        }
    }

    private List<String> extractRoles(Jwt jwt) {
        if (jwt == null) {
            return List.of();
        }
        List<String> roles = jwt.getClaim("roles");
        return roles != null ? roles : List.of();
    }
}
