package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitInquiryPostRequest;
import com.bgmagitapi.controller.request.BgmAgitInquiryPutRequest;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitInquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitInquiryController {
    
    private final BgmAgitInquiryService inquiryService;
    
    
    @GetMapping("/inquiry")
    public PageResponse<BgmAgitInquiryGetResponse>  getInquiry(@PageableDefault(size = 10) Pageable pageable,
                                                               @AuthenticationPrincipal Jwt jwt) {
        if(jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = Optional.ofNullable(jwt)
                .map(token -> token.getClaim("id"))
                .map(Object::toString)
                .map(Long::valueOf)
                .orElse(null);
        String role = extractRole(jwt);
        Page<BgmAgitInquiryGetResponse> inquiry = inquiryService.getInquiry(memberId, role, pageable);
        return PageResponse.from(inquiry);
    }
    
    @GetMapping("/inquiry/{id}")
    public BgmAgitInquiryGetDetailResponse getDetailResponse(@PathVariable Long id) {
        return inquiryService.getDetailInquiry(id);
    }
    
    @PostMapping ("/inquiry")
    public ApiResponse createInquiry(@Validated @ModelAttribute BgmAgitInquiryPostRequest request, @AuthenticationPrincipal Jwt jwt) {
        if(jwt == null) {
            throw new RuntimeException("비 로그인입니다.");
        }
        Long memberId = Optional.ofNullable(jwt)
                .map(token -> token.getClaim("id"))
                .map(Object::toString)
                .map(Long::valueOf)
                .orElse(null);
        request.setMemberId(memberId);
        return inquiryService.createInquiry(request);
    }
    
    @PutMapping("/inquiry")
    public ApiResponse modifyInquiry(@Validated @ModelAttribute BgmAgitInquiryPutRequest request) {
        return inquiryService.modifyInquiry(request);
    }
    
    @DeleteMapping("/inquiry/{id}")
    public ApiResponse deleteInquiry(@PathVariable Long id) {
        return inquiryService.deleteInquiry(id);
    }
    
    private String extractRole(Jwt jwt) {
        List<String> roles = jwt.getClaim("roles");
        return roles != null && !roles.isEmpty() ? roles.get(0) : "GUEST";
    }
    
}
