package com.bgmagitapi.file.service;

import com.bgmagitapi.file.entity.BgmAgitFile;
import com.bgmagitapi.file.repository.BgmAgitFileRepository;
import com.bgmagitapi.repository.BgmAgitRefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class FileBatchService {

    private final BgmAgitFileRepository bgmAgitFileRepository;
    private final BgmAgitRefreshTokenRepository bgmAgitRefreshTokenRepository;
    private final S3Client s3Client;

    public void temporaryFileRemove(LocalDateTime targetTime, String bucket) {
        List<BgmAgitFile> files = bgmAgitFileRepository.findTemporaryFilesBefore(targetTime);
        for (BgmAgitFile file : files) {
            try {
                DeleteObjectRequest request = DeleteObjectRequest.builder()
                        .bucket(bucket)
                        .key(file.getFilePath())
                        .build();
                s3Client.deleteObject(request);
            } catch (Exception e) {
                log.warn("[file-batch] S3 삭제 실패 fileId={} key={}", file.getId(), file.getFilePath(), e);
            }
        }
        bgmAgitFileRepository.deleteAll(files);
        long deletedRefreshTokens = bgmAgitRefreshTokenRepository.deleteByModifyDateBefore(targetTime);
        log.info("[file-batch] expired refresh token cleanup complete count={}", deletedRefreshTokens);
        log.info("[file-batch] TEMPORARY 파일 정리 완료 count={}", files.size());
    }
}
