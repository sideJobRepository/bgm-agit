package com.bgmagitapi.origin.controller;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitBungjuSettingRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitBungjuBenefitResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitBungjuSettingResponse;
import com.bgmagitapi.origin.service.BgmAgitBungjuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/** 벙주 혜택 관리(관리자 전용). 서비스단에서 관리자 여부를 다시 확인한다 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitBungjuController {

    private final BgmAgitBungjuService bgmAgitBungjuService;

    @GetMapping("/bungju/setting")
    public BgmAgitBungjuSettingResponse getSetting(@AuthenticationPrincipal Jwt jwt) {
        return bgmAgitBungjuService.getSetting(extractRoles(jwt));
    }

    @PutMapping("/bungju/setting")
    public ApiResponse updateSetting(@AuthenticationPrincipal Jwt jwt,
                                     @Valid @RequestBody BgmAgitBungjuSettingRequest request) {
        return bgmAgitBungjuService.updateSetting(request, extractRoles(jwt));
    }

    /** 혜택가 예약 내역. 이용일 기준 [from, to] */
    @GetMapping("/bungju/reservations")
    public List<BgmAgitBungjuBenefitResponse> getBenefitReservations(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "from") String from,
            @RequestParam(name = "to") String to) {
        return bgmAgitBungjuService.getBenefitReservations(
                LocalDate.parse(from.substring(0, 10)),
                LocalDate.parse(to.substring(0, 10)),
                extractRoles(jwt));
    }

    private List<String> extractRoles(Jwt jwt) {
        if (jwt == null) {
            return List.of();
        }
        List<String> roles = jwt.getClaim("roles");
        return roles != null ? roles : List.of();
    }
}
