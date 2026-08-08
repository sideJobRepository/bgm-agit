package com.bgmagitapi.origin.controller;


import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.origin.controller.response.reservation.AdminReservationBoardResponse;
import com.bgmagitapi.origin.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.origin.page.PageResponse;
import com.bgmagitapi.origin.service.BgmAgitReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitReservationController {
    
    
    private final BgmAgitReservationService bgmAgitReservationService;
    
    @GetMapping("/reservation")
    public BgmAgitReservationResponse getReservation(
            @RequestParam(name = "labelGb") Long labelGb,
            @RequestParam(name = "link") String link,
            @RequestParam(name = "id") Long id,
            // 합쳐 예약할 항목들(예: M-1 조회에 M-2를 붙이면 두 항목이 모두 비어 있는 시간만 내려온다)
            @RequestParam(name = "ids", required = false) List<Long> ids,
            @RequestParam(name = "date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr.substring(0, 10));
        return bgmAgitReservationService.getReservation(labelGb, link, id, ids, date);
    }
    
    @PostMapping("/reservation")
    public ApiResponse createReservation(@RequestBody BgmAgitReservationCreateRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("id");
        return bgmAgitReservationService.createReservation(request, userId);
    }
    
    @GetMapping("/reservation/detail")
    public PageResponse<GroupedReservationResponse> getReservationDetail(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10, sort = "bgmAgitReservationId", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate" , required = false) String endDate
            ) {
        Long memberId = extractMemberId(jwt);
        String role = extractRole(jwt);
        Page<GroupedReservationResponse> reservationDetail = bgmAgitReservationService.getReservationDetail(memberId, role, startDate, endDate, pageable);
        return PageResponse.from(reservationDetail);
    }
    /**
     * 관리자 예약 현황판. date 미지정이면 오늘(KST) 기준.
     * URL_RESOURCES 매핑이 없으면 기본 permit 이므로 서비스단에서도 관리자 여부를 다시 확인한다.
     */
    @GetMapping("/reservation/board")
    public AdminReservationBoardResponse getReservationBoard(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "date", required = false) String date) {
        LocalDate target = (date != null && !date.isBlank())
                ? LocalDate.parse(date.substring(0, 10))
                : LocalDate.now(ZoneId.of("Asia/Seoul"));
        return bgmAgitReservationService.getReservationBoard(target, extractRoles(jwt));
    }


    @PutMapping("/reservation")
    public ApiResponse modifyReservation(@AuthenticationPrincipal Jwt jwt , @RequestBody BgmAgitReservationModifyRequest request) {
        Long id = jwt.getClaim("id");
        String role = extractRole(jwt);
        return bgmAgitReservationService.modifyReservation(id,request,role);
    }
    
    @PutMapping("/reservation/admin")
    public ApiResponse modifyAdminReservation(@AuthenticationPrincipal Jwt jwt , @RequestBody BgmAgitReservationModifyRequest request) {
        Long id = jwt.getClaim("id");
        String role = extractRole(jwt);
        return bgmAgitReservationService.modifyReservation(id,request,role);
    }
    
    
    
    
    private Long extractMemberId(Jwt jwt) {
        return jwt.getClaim("id");
    }
    
    private String extractRole(Jwt jwt) {
        List<String> roles = jwt.getClaim("roles");
        return roles != null && !roles.isEmpty() ? roles.get(0) : "GUEST";
    }

    private List<String> extractRoles(Jwt jwt) {
        if (jwt == null) {
            return List.of();
        }
        List<String> roles = jwt.getClaim("roles");
        return roles != null ? roles : List.of();
    }
    
    
}
