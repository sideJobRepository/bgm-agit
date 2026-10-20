package com.bgmagitapi.origin.controller;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitHolidayRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitHolidayResponse;
import com.bgmagitapi.origin.service.BgmAgitHolidayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitHolidayController {

    private final BgmAgitHolidayService bgmAgitHolidayService;

    /**
     * 기간 안의 공휴일 목록. 법정공휴일(자동)과 수동 예외를 합쳐 내려준다.
     * 요금 안내용이라 비로그인도 볼 수 있다(개인정보 없음).
     */
    @GetMapping("/holidays")
    public List<BgmAgitHolidayResponse> getHolidays(
            @RequestParam(name = "from") String from,
            @RequestParam(name = "to") String to) {
        return bgmAgitHolidayService.getHolidays(
                LocalDate.parse(from.substring(0, 10)),
                LocalDate.parse(to.substring(0, 10)));
    }

    /** 수동 예외 등록·수정(날짜 기준 upsert). 관리자 전용 — 서비스단에서 다시 확인한다 */
    @PostMapping("/holidays")
    public ApiResponse saveHoliday(@AuthenticationPrincipal Jwt jwt,
                                   @Valid @RequestBody BgmAgitHolidayRequest request) {
        return bgmAgitHolidayService.saveHoliday(request, extractRoles(jwt));
    }

    /** 수동 예외 삭제. 지우면 그 날은 다시 법정공휴일 계산 결과를 따른다 */
    @DeleteMapping("/holidays/{holidayId}")
    public ApiResponse deleteHoliday(@AuthenticationPrincipal Jwt jwt,
                                     @PathVariable("holidayId") Long holidayId) {
        return bgmAgitHolidayService.deleteHoliday(holidayId, extractRoles(jwt));
    }

    private List<String> extractRoles(Jwt jwt) {
        if (jwt == null) {
            return List.of();
        }
        List<String> roles = jwt.getClaim("roles");
        return roles != null ? roles : List.of();
    }
}
