package com.bgmagitapi.kml.lecture.controller;


import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.lecture.dto.request.LecturePostRequest;
import com.bgmagitapi.kml.lecture.dto.response.LectureGetResponse;
import com.bgmagitapi.kml.lecture.service.LectureService;
import com.bgmagitapi.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class LectureController {

    private final LectureService lectureService;
    
    @GetMapping("/lecture")
    public LectureGetResponse getLecture(@RequestParam Integer year
            , @RequestParam Integer month
            , @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return lectureService.getLectureGetResponse(year, month, memberId);
    }
    
    @PostMapping("/lecture")
    public ApiResponse createLecture(@Validated @RequestBody LecturePostRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        if(memberId == null){
            throw new ValidException("로그인후 이용해주세요");
        }
        return lectureService.createLecture(request, memberId);
    }
}
