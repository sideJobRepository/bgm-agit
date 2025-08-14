package com.bgmagitapi.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.service.BgmAgitReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
            @RequestParam(name = "date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr.substring(0, 10));
        return bgmAgitReservationService.getReservation(labelGb, link, id, date);
    }
    
    @PostMapping("/reservation")
    public ApiResponse createReservation(@RequestBody BgmAgitReservationCreateRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("id");
        return bgmAgitReservationService.createReservation(request, userId);
    }
    
    @GetMapping("/reservation/detail")
    public Page<GroupedReservationResponse> getReservationDetail(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10, sort = "bgmAgitReservationId", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate" , required = false) String endDate
            ) {
        Long memberId = extractMemberId(jwt);
        String role = extractRole(jwt);
        return bgmAgitReservationService.getReservationDetail(memberId, role, startDate, endDate, pageable);
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
    
    
}
