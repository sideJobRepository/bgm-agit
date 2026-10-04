package com.bgmagitapi.origin.controller;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.config.S3FileUtils;
import com.bgmagitapi.origin.controller.request.BgmAgitServiceRequestPostRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitServiceRequestPutRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitServiceRequestGetDetailResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitServiceRequestGetResponse;
import com.bgmagitapi.origin.page.PageResponse;
import com.bgmagitapi.origin.service.BgmAgitServiceRequestService;
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
import java.util.List;

/**
 * 서비스 요청(유지보수 요청) 게시판 — 관리자 전용.
 * URL_RESOURCES 에 매핑이 없으면 기본 통과라 모든 엔드포인트에서 직접 관리자 검사를 한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitServiceRequestController {

    private static final String S3_FOLDER = "service-request";

    private final BgmAgitServiceRequestService serviceRequestService;

    private final S3Client s3Client;

    private final S3FileUtils s3FileUtils;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    private void requireAdmin(Jwt jwt) {
        List<String> roles = jwt == null ? null : jwt.getClaim("roles");
        if (roles == null || !(roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"))) {
            throw new ForbiddenException("관리자만 사용할 수 있습니다.");
        }
    }

    @GetMapping("/service-request")
    public PageResponse<BgmAgitServiceRequestGetResponse> getServiceRequests(@PageableDefault(size = 10) Pageable pageable,
                                                                            @AuthenticationPrincipal Jwt jwt,
                                                                            @RequestParam(name = "titleOrCont", required = false) String titleOrCont) {
        requireAdmin(jwt);
        return PageResponse.from(serviceRequestService.getServiceRequests(pageable, titleOrCont));
    }

    @GetMapping("/service-request/{id}")
    public BgmAgitServiceRequestGetDetailResponse getDetailServiceRequest(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return serviceRequestService.getDetailServiceRequest(id);
    }

    @PostMapping("/service-request")
    public ApiResponse createServiceRequest(@Validated @ModelAttribute BgmAgitServiceRequestPostRequest request,
                                            @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        request.setMemberId(Long.valueOf(jwt.getClaim("id").toString()));
        return serviceRequestService.createServiceRequest(request);
    }

    @PutMapping("/service-request")
    public ApiResponse modifyServiceRequest(@Validated @ModelAttribute BgmAgitServiceRequestPutRequest request,
                                            @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return serviceRequestService.modifyServiceRequest(request);
    }

    @DeleteMapping("/service-request/{id}")
    public ApiResponse deleteServiceRequest(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return serviceRequestService.deleteServiceRequest(id);
    }

    @GetMapping("/service-request/download/{folder}/{fileName}")
    public ResponseEntity<Resource> download(@PathVariable String folder,
                                             @PathVariable String fileName,
                                             @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        // 이 게시판 폴더만 내려준다
        if (!S3_FOLDER.equals(folder)) {
            throw new ForbiddenException("다운로드할 수 없는 파일입니다.");
        }
        ResponseInputStream<GetObjectResponse> object = s3Client.getObject(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(folder + "/" + fileName)
                        .build()
        );

        String encodedFilenameInMetadata = object.response().metadata().get("original-filename");
        String decodedFilename = encodedFilenameInMetadata != null
                ? URLDecoder.decode(encodedFilenameInMetadata, StandardCharsets.UTF_8)
                : fileName;
        String contentDisposition = "attachment; filename*=UTF-8''" + UriUtils.encode(decodedFilename, StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(object));
    }

    /** CKEditor 본문 이미지 업로드 */
    @PostMapping("/service-request/file")
    public String uploadEditorFile(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return s3FileUtils.storeFile(file, S3_FOLDER).getUrl();
    }
}
