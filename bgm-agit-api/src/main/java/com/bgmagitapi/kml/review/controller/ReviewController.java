package com.bgmagitapi.kml.review.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.controller.request.BgmAgitFreePutRequest;
import com.bgmagitapi.kml.review.dto.request.ReviewPostRequest;
import com.bgmagitapi.kml.review.dto.request.ReviewPutRequest;
import com.bgmagitapi.kml.review.dto.response.ReviewGetDetailResponse;
import com.bgmagitapi.kml.review.dto.response.ReviewGetResponse;
import com.bgmagitapi.kml.review.service.ReviewService;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.security.xss.HtmlSanitizerService;
import com.bgmagitapi.util.JwtParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@RestController
@RequestMapping("/bgm-agit")
@RequiredArgsConstructor
public class ReviewController {
    
    
    private final ReviewService reviewService;
    
    private final S3Client s3Client;
    
    private final S3FileUtils s3FileUtils;
    
    private final HtmlSanitizerService sanitizer;
    
    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;
    
    @GetMapping("/review")
    public PageResponse<ReviewGetResponse> getReviews(@PageableDefault(size = 10) Pageable pageable,
                                                          @RequestParam(name = "titleOrCont" , required = false) String titleOrCont) {
        Page<ReviewGetResponse> reviews = reviewService.getReviews(pageable, titleOrCont);
        return PageResponse.from(reviews);
    }
    
    @GetMapping("/review/{reviewId}")
    public ReviewGetDetailResponse getReviewDetail(@PathVariable Long reviewId, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return reviewService.getReviewDetail(reviewId,memberId);
    }
    
    @PostMapping("/review")
    public ApiResponse createReview(@Validated @ModelAttribute ReviewPostRequest request) {
        String safeHtml = sanitizer.sanitize(request.getCont());
        request.setCont(safeHtml);
        return reviewService.createReview(request);
    }
    
    @PutMapping("/review")
    public ApiResponse modifyBgmAgitFree(@Validated @ModelAttribute ReviewPutRequest request) {
        String safeHtml = sanitizer.sanitize(request.getCont());
        request.setCont(safeHtml);
        return reviewService.modifyReview(request);
    }
    
    @DeleteMapping("/review/{reviewId}")
    public ApiResponse removeBgmAgitFree(@PathVariable Long reviewId, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = JwtParserUtil.extractMemberId(jwt);
        return reviewService.deleteReview(reviewId,memberId);
    }
    
}
