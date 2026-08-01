package com.bgmagitapi.origin.file.service;

import com.bgmagitapi.origin.file.dto.request.FileRequest;
import com.bgmagitapi.origin.file.dto.request.FileUploadRequest;
import com.bgmagitapi.origin.file.dto.response.FileUploadResponse;
import com.bgmagitapi.origin.file.dto.response.FileViewResponse;
import com.bgmagitapi.origin.file.dto.response.PresignedUrlResponse;
import com.bgmagitapi.origin.file.entity.BgmAgitFile;
import com.bgmagitapi.origin.file.enums.FileProcessStatus;
import com.bgmagitapi.origin.file.enums.FileStatus;
import com.bgmagitapi.origin.file.enums.FileType;
import com.bgmagitapi.origin.file.repository.BgmAgitFileRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * S3 업/다운로드 + {@link BgmAgitFile} 라이프사이클 관리.
 *
 * 파일 라이프사이클:
 * 1. {@link #getUploadPresignedUrl} 로 PUT URL 발급 (5분 유효)
 * 2. 프론트가 S3 로 직접 PUT
 * 3. {@link #uploadFile} 로 메타데이터 등록 (TEMPORARY 상태)
 * 4. 도메인 저장 시 {@link #modifyFileStatus} 호출 → targetId 박고 COMPLETE
 * 5. TEMPORARY 1일 이상 방치된 파일은 새벽 1시 배치가 수거
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BgmAgitFileService {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final BgmAgitFileRepository bgmAgitFileRepository;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    /**
     * 업로드용 Presigned PUT URL 발급. 객체 키는 {@code UUID.확장자} 형태로 충돌·경로 추정 차단.
     */
    public List<PresignedUrlResponse> getUploadPresignedUrl(FileUploadRequest request) {
        return request.getFiles().stream().map(file -> {
            String objectKey = UUID.randomUUID() + "." + FilenameUtils.getExtension(file.getFileName());

            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(5))
                    .putObjectRequest(objectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

            return new PresignedUrlResponse(
                    presignedRequest.url().toString(),
                    objectKey,
                    file.getFileName(),
                    bucket,
                    file.getContentType()
            );
        }).toList();
    }

    /**
     * PUT 완료된 파일의 메타데이터를 DB에 등록. 시작 상태는 TEMPORARY.
     * 도메인 저장 단계에서 {@link #modifyFileStatus} 로 COMPLETE 로 승격되며,
     * 승격 안 되면 일일 배치가 정리한다.
     */
    public List<FileUploadResponse> uploadFile(FileUploadRequest request) {
        FileType fileType = request.getFileType();
        return request.getFiles().stream()
                .map(file -> {
                    BgmAgitFile save = BgmAgitFile.builder()
                            .fileName(file.getFileName())
                            .fileSize(file.getFileSize())
                            .fileContentType(file.getContentType())
                            .filePath(file.getObjectKey())
                            .fileType(fileType)
                            .bucketName(file.getBucketName())
                            .fileStatus(FileStatus.TEMPORARY)
                            .build();
                    bgmAgitFileRepository.save(save);
                    return FileUploadResponse.from(save);
                })
                .toList();
    }

    /**
     * 단건 다운로드용 Presigned GET URL 발급 (5분 유효).
     * {@code Content-Disposition: attachment} 를 서명에 박아 두기 때문에 브라우저가 어떻게 GET 하든
     * 다운로드로 처리됨 ({@code <a download>} 만으로 충분).
     */
    @Transactional(readOnly = true)
    public String fileDownload(Long id) {
        BgmAgitFile file = bgmAgitFileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재 하지 않는 파일 ID 입니다 : " + id));

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(file.getFilePath())
                .responseContentDisposition(buildContentDisposition(file.getFileName()))
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedGetObjectRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedGetObjectRequest.url().toString();
    }

    /**
     * 다건 ZIP 다운로드. 서버가 S3 에서 파일별 스트림을 열어 즉시 ZIP 으로 흘려보냄 (메모리 적재 X).
     */
    @Transactional(readOnly = true)
    public void downloadFilesAsZip(List<Long> ids, String zipFileName, HttpServletResponse response) throws IOException {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("파일 ID가 필요합니다");
        }
        List<BgmAgitFile> files = bgmAgitFileRepository.findFilesIds(ids);
        if (files.isEmpty()) {
            throw new IllegalArgumentException("다운로드할 파일을 찾을 수 없습니다");
        }

        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", buildContentDisposition(zipFileName));

        Set<String> taken = new HashSet<>();
        try (OutputStream out = response.getOutputStream();
             ZipOutputStream zos = new ZipOutputStream(out)) {
            for (BgmAgitFile file : files) {
                String entryName = disambiguateName(taken, file.getFileName());
                zos.putNextEntry(new ZipEntry(entryName));
                try (ResponseInputStream<GetObjectResponse> s3stream = s3Client.getObject(
                        GetObjectRequest.builder().bucket(bucket).key(file.getFilePath()).build())) {
                    s3stream.transferTo(zos);
                }
                zos.closeEntry();
            }
            zos.finish();
        }
    }

    /**
     * 도메인 저장/수정 시 첨부 파일 상태 일괄 전환.
     * - CREATE: TEMPORARY → COMPLETE + targetId 세팅
     * - DELETE: COMPLETE → TEMPORARY (즉시 삭제 X, 일일 배치가 수거)
     */
    public void modifyFileStatus(FileRequest request, Long targetId) {
        if (request == null) return;
        List<FileRequest.FileChangeRequest> files = request.getFiles();
        if (files.isEmpty()) return;

        List<Long> createFileIds = files.stream()
                .filter(item -> item.getFileProcessStatus() == FileProcessStatus.CREATE)
                .map(FileRequest.FileChangeRequest::getId)
                .toList();

        List<Long> deleteFileIds = files.stream()
                .filter(item -> item.getFileProcessStatus() == FileProcessStatus.DELETE)
                .map(FileRequest.FileChangeRequest::getId)
                .toList();

        List<BgmAgitFile> createFile = bgmAgitFileRepository.findFilesIds(createFileIds);
        createFile.forEach(item -> item.createTargetIdAndModifyCompleteFileStatus(targetId));

        List<BgmAgitFile> deleteFile = bgmAgitFileRepository.findFilesIds(deleteFileIds);
        deleteFile.forEach(BgmAgitFile::modifyTemporaryFileStatus);
    }

    /**
     * 도메인 행이 삭제될 때 그에 연결된 COMPLETE 파일을 조회.
     * 호출부가 직접 modifyTemporaryFileStatus() 를 호출해 배치 정리 대상으로 마킹한다.
     */
    @Transactional(readOnly = true)
    public List<BgmAgitFile> findCompletedByTargets(List<Long> targetIds, FileType fileType) {
        return bgmAgitFileRepository.findByTargetIdsAndFileType(targetIds, fileType);
    }

    /**
     * 도메인 행이 복구될 때 그에 묶여있던 TEMPORARY 파일을 조회.
     * 배치가 아직 정리하지 않은 파일들만 잡힘 → 호출부가 restoreCompleteFileStatus() 로 다시 살림.
     */
    @Transactional(readOnly = true)
    public List<BgmAgitFile> findTemporaryByTargets(List<Long> targetIds, FileType fileType) {
        return bgmAgitFileRepository.findTemporaryByTargetIdsAndFileType(targetIds, fileType);
    }

    /**
     * CK Editor 등 인라인 업로드 트랙용 — 멀티파트로 받은 파일을 S3 에 직접 PUT 하고
     * BgmAgitFile 을 TEMPORARY 로 등록한다. 응답은 public URL 문자열 (CK Editor 어댑터 호환).
     * 도메인 저장 시 InlineFileTracker.syncInlineFiles() 가 본문에서 매칭해 COMPLETE 로 승격한다.
     */
    public String registerInlineUpload(org.springframework.web.multipart.MultipartFile file,
                                       String folder,
                                       FileType fileType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어 있습니다.");
        }
        String originalFilename = file.getOriginalFilename();
        String ext = originalFilename == null ? "" : FilenameUtils.getExtension(originalFilename);
        String objectKey = folder + "/" + UUID.randomUUID() + (ext.isBlank() ? "" : "." + ext);

        try {
            PutObjectRequest put = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .build();
            s3Client.putObject(put, software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));
        } catch (java.io.IOException e) {
            throw new RuntimeException("S3 업로드 실패", e);
        }

        BgmAgitFile saved = BgmAgitFile.builder()
                .fileName(originalFilename)
                .fileSize((int) file.getSize())
                .fileContentType(file.getContentType())
                .filePath(objectKey)
                .fileType(fileType)
                .bucketName(bucket)
                .fileStatus(FileStatus.TEMPORARY)
                .build();
        bgmAgitFileRepository.save(saved);

        return s3Client.utilities().getUrl(b -> b.bucket(bucket).key(objectKey)).toExternalForm();
    }

    /**
     * 조회용 Presigned GET URL 일괄 반환. 요청된 id 순서를 유지한다.
     */
    @Transactional(readOnly = true)
    public List<FileViewResponse> getFilesForView(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();

        List<BgmAgitFile> files = bgmAgitFileRepository.findFilesIds(ids);
        java.util.Map<Long, BgmAgitFile> byId = files.stream()
                .collect(java.util.stream.Collectors.toMap(BgmAgitFile::getId, f -> f));

        return ids.stream()
                .map(byId::get)
                .filter(java.util.Objects::nonNull)
                .map(file -> {
                    GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                            .bucket(bucket)
                            .key(file.getFilePath())
                            .build();
                    GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                            .signatureDuration(Duration.ofMinutes(50))
                            .getObjectRequest(getObjectRequest)
                            .build();
                    PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presignRequest);
                    return new FileViewResponse(file.getId(), file.getFileName(), presigned.url().toString());
                })
                .toList();
    }

    private String buildContentDisposition(String fileName) {
        String safe = fileName == null ? "file" : fileName;
        String asciiFallback = safe.replaceAll("[^\\x20-\\x7E]", "_").replace("\"", "'");
        String utf8Encoded = URLEncoder.encode(safe, StandardCharsets.UTF_8).replace("+", "%20");
        return "attachment; filename=\"" + asciiFallback + "\"; filename*=UTF-8''" + utf8Encoded;
    }

    private String disambiguateName(Set<String> taken, String name) {
        if (taken.add(name)) return name;
        int dot = name.lastIndexOf('.');
        String base = dot > 0 ? name.substring(0, dot) : name;
        String ext = dot > 0 ? name.substring(dot) : "";
        int n = 2;
        while (!taken.add(base + "-" + n + ext)) n++;
        return base + "-" + n + ext;
    }
}
