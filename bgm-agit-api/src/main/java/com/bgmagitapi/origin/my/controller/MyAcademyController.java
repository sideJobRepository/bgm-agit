package com.bgmagitapi.origin.my.controller;


import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.my.dto.request.MyAcademyApprovalRequest;
import com.bgmagitapi.origin.my.dto.request.MyAcademyCancelRequest;
import com.bgmagitapi.origin.my.dto.response.MyAcademyGetResponse;
import com.bgmagitapi.origin.my.service.MyAcademyService;
import com.bgmagitapi.origin.page.PageResponse;
import com.bgmagitapi.origin.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class MyAcademyController {

    private final MyAcademyService myAcademyService;
    
    
    @GetMapping("/my-academy")
    public PageResponse<MyAcademyGetResponse> getMyAcademy(@PageableDefault(size = 10) Pageable pageable, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        if(memberId == null){
            throw new ValidException("다시 로그인 해주세요");
        }
        String role = JwtParserUtil.extractRole(jwt);
        Page<MyAcademyGetResponse> myAcademy = myAcademyService.getMyAcademy(pageable, memberId, role);
        return PageResponse.from(myAcademy);
    }
    
    @PostMapping("/my-academy/approval")
    public ApiResponse completeAcademy(@RequestBody MyAcademyApprovalRequest request) {
        return myAcademyService.approvalMyAcademy(request);
    }
    
    @PostMapping("/my-academy/cancel")
    public ApiResponse cancelAcademy(@RequestBody MyAcademyCancelRequest request,@AuthenticationPrincipal Jwt jwt){
        String role = JwtParserUtil.extractRole(jwt);
        return myAcademyService.cancelMyAcademy(request,role);
    }
}
