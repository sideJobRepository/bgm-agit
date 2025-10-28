package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.controller.request.BgmAgitFreePutRequest;
import com.bgmagitapi.controller.response.BgmAgitFreeGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitFreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
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
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitFreeController {

    
    private final BgmAgitFreeService bgmAgitFreeService;
    
    private final S3Client s3Client;
    
    private final S3FileUtils s3FileUtils;
    
    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;
    
    @GetMapping("/free")
    public PageResponse<BgmAgitFreeGetResponse> getBgmAgitFree(@PageableDefault(size = 10) Pageable pageable,
                                                               @RequestParam(name = "titleOrCont" , required = false) String titleOrCont) {
        return bgmAgitFreeService.getBgmAgitFree(pageable,titleOrCont);
    }
    
    @GetMapping("/free/{id}")
    public BgmAgitFreeGetDetailResponse getBgmAgitFreeDetail(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = Optional.ofNullable(jwt)
                .map(token -> token.getClaim("id"))
                .map(Object::toString)
                .map(Long::valueOf)
                .orElse(null);
        return bgmAgitFreeService.getBgmAgitFreeDetail(id,memberId);
    }
    
    @PostMapping("/free")
    public ApiResponse createBgmAgitFree(@Validated @ModelAttribute BgmAgitFreePostRequest request) {
        return bgmAgitFreeService.createBgmAgitFree(request);
    }
    @PutMapping("/free")
    public ApiResponse modifyBgmAgitFree(@Validated @ModelAttribute BgmAgitFreePutRequest request) {
        return bgmAgitFreeService.modifyBgmAgitFree(request);
    }
    @DeleteMapping("/free/{id}")
    public ApiResponse removeBgmAgitFree(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Long memberId = Optional.ofNullable(jwt)
                     .map(token -> token.getClaim("id"))
                     .map(Object::toString)
                     .map(Long::valueOf)
                     .orElse(null);
        return bgmAgitFreeService.romoveBgmAgitFree(id,memberId);
    }
    
    @GetMapping("/free/download/{folder}/{fileName}")
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
    
    @PostMapping("/free/file")
    public String noticeFile(@RequestParam("file") MultipartFile file) {
        UploadResult notice = s3FileUtils.storeFile(file, "free");
        return notice.getUrl();
    }
    
}
