package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeResponse;
import com.bgmagitapi.page.PageResponse;
import com.bgmagitapi.service.BgmAgitNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitNoticeController {
    
    private final BgmAgitNoticeService bgmAgitNoticeService;
    
    private final S3Client s3Client;
    
    private final S3FileUtils s3FileUtils;
    
    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;
    
    @GetMapping("/notice")
    public PageResponse<BgmAgitNoticeResponse> getNotice(@PageableDefault(size = 10, sort = "bgmAgitNoticeId", direction = Sort.Direction.DESC) Pageable pageable,
                                                         @RequestParam(name = "titleOrCont" , required = false) String titleOrCont
                                                 ) {
        Page<BgmAgitNoticeResponse> notice = bgmAgitNoticeService.getNotice(pageable, titleOrCont);
        return PageResponse.from(notice);
    }
    @PostMapping("/notice")
    public ApiResponse createNotice(@Validated @ModelAttribute BgmAgitNoticeCreateRequest request) {
        return bgmAgitNoticeService.createNotice(request);
    }
    
    
    @PutMapping("/notice")
    public ApiResponse modifyNotice(@Validated @ModelAttribute BgmAgitNoticeModifyRequest request) {
        return bgmAgitNoticeService.modifyNotice(request);
    }
    
    
    @DeleteMapping("/notice/{id}")
    public ApiResponse deleteNotice(@PathVariable Long id) {
        return bgmAgitNoticeService.deleteNotice(id);
    }
    
    @GetMapping("/notice/download/{folder}/{fileName}")
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
    
    @PostMapping("/notice/file")
    public String noticeFile(@RequestParam("file") MultipartFile file) {
        UploadResult notice = s3FileUtils.storeFile(file, "notice");
        return notice.getUrl();
    }
    
}
