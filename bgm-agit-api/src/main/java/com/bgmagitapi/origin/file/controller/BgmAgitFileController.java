package com.bgmagitapi.origin.file.controller;

import com.bgmagitapi.origin.file.dto.request.FileUploadRequest;
import com.bgmagitapi.origin.file.dto.request.FileZipDownloadRequest;
import com.bgmagitapi.origin.file.dto.response.FileUploadResponse;
import com.bgmagitapi.origin.file.dto.response.FileViewResponse;
import com.bgmagitapi.origin.file.dto.response.PresignedUrlResponse;
import com.bgmagitapi.origin.file.service.BgmAgitFileService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * S3 파일 업/다운로드 공용 엔드포인트.
 * - 업로드: presign → 프론트 PUT → register (3단계). 서버는 바이트를 거치지 않음
 * - 다운로드: 단건은 presigned GET URL, 다건은 서버 스트리밍 ZIP
 */
@RestController
@RequestMapping("/bgm-agit")
@RequiredArgsConstructor
public class BgmAgitFileController {

    private final BgmAgitFileService bgmAgitFileService;

    /** [업로드 1단계] PUT 용 presigned URL 발급. */
    @PostMapping("/presigned-url")
    public List<PresignedUrlResponse> getPresignedUrl(@RequestBody FileUploadRequest request) {
        return bgmAgitFileService.getUploadPresignedUrl(request);
    }

    /** [업로드 3단계] PUT 성공 후 메타데이터 등록 (TEMPORARY 상태). */
    @PostMapping("/upload-file")
    public List<FileUploadResponse> uploadFile(@RequestBody FileUploadRequest request) {
        return bgmAgitFileService.uploadFile(request);
    }

    /** 단건 다운로드용 presigned GET URL. */
    @GetMapping("/download-file/{id}")
    public String downloadFile(@PathVariable Long id) {
        return bgmAgitFileService.fileDownload(id);
    }

    /** 다건 ZIP 다운로드 (서버 스트리밍). */
    @PostMapping("/download-file/zip")
    public void downloadFilesAsZip(@RequestBody FileZipDownloadRequest request,
                                   HttpServletResponse response) throws IOException {
        String name = (request.name() == null || request.name().isBlank()) ? "files.zip" : request.name();
        bgmAgitFileService.downloadFilesAsZip(request.ids(), name, response);
    }

    /** 조회용 presigned GET URL 일괄 발급 (50분 유효). */
    @PostMapping("/file-view")
    public List<FileViewResponse> getFilesForView(@RequestBody List<Long> ids) {
        return bgmAgitFileService.getFilesForView(ids);
    }
}
