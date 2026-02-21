package com.bgmagitapi.kml.reviewconment.controller;


import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.reviewconment.dto.request.ReviewCommentPostRequest;
import com.bgmagitapi.kml.reviewconment.dto.request.ReviewCommentPutRequest;
import com.bgmagitapi.kml.reviewconment.service.ReviewCommentService;
import com.bgmagitapi.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bgm-agit")
@RequiredArgsConstructor
public class ReviewCommentController {
    
    private final ReviewCommentService reviewCommentService;
    
    @PostMapping("/review-comment")
    public ApiResponse createComment(@Validated @RequestBody ReviewCommentPostRequest request, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        if(memberId == null){
            throw new ValidException("다시 로그인 해주세요");
        }
        request.setMemberId(memberId);
        return reviewCommentService.createComment(request);
    }
    
    @PutMapping("/review-comment")
    public ApiResponse modifyComment(@Validated @RequestBody ReviewCommentPutRequest request) {
        return reviewCommentService.modifyComment(request);
    }
    @DeleteMapping("/review-comment/{commentId}")
    public ApiResponse removeComment(@PathVariable Long commentId) {
        return reviewCommentService.removeComment(commentId);
    }
}

