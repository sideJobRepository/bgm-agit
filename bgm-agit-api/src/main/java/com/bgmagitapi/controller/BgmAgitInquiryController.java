package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitInquiryPostRequest;
import com.bgmagitapi.controller.request.BgmAgitInquiryPutRequest;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitInquiryGetResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitInquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitInquiryController {
    
    private final BgmAgitInquiryService inquiryService;
    
    private final S3Client s3Client;
    
    private final S3FileUtils s3FileUtils;
    
    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;
    
    
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
    
    @GetMapping("/inquiry/download/{folder}/{fileName}")
           public ResponseEntity<Resource> download(
                   @PathVariable String fileName,
                   @PathVariable String folder
           ) {
               String key = folder + "/" + fileName;
               ResponseInputStream<GetObjectResponse> object = s3Client.getObject(
                       GetObjectRequest.builder()
                               .bucket(bucketName)
                               .key(key)
                               .build()
               );
               
               // 메타데이터에서 원본 파일명 가져오기
               String encodedFilenameInMetadata = object.response().metadata().get("original-filename");
               
               // 원래 이름 복원 (디코딩)
               String decodedFilename = encodedFilenameInMetadata != null
                       ? URLDecoder.decode(encodedFilenameInMetadata, StandardCharsets.UTF_8)
                       : fileName;
               
               // 다시 Content-Disposition용으로 인코딩 (한 번만)
               String encodedFilename = UriUtils.encode(decodedFilename, StandardCharsets.UTF_8);
               String contentDisposition = "attachment; filename*=UTF-8''" + encodedFilename;
               
               InputStreamResource resource = new InputStreamResource(object);
               return ResponseEntity.ok()
                       .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                       .contentType(MediaType.APPLICATION_OCTET_STREAM)
                       .body(resource);
           }
       
       @PostMapping("/inquiry/file")
       public String noticeFile(@RequestParam("file") MultipartFile file) {
           UploadResult notice = s3FileUtils.storeFile(file, "inquiry");
           return notice.getUrl();
       }
    
}
