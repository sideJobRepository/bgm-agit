package com.bgmagitapi.origin.murder.util;

import com.bgmagitapi.origin.config.S3FileUtils;
import com.bgmagitapi.origin.murder.util.CoverImageNormalizer.NormalizedImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 머더 게임 표지를 S3 에 올린다. 올리기 전에 항상 크기를 맞춘다(CoverImageNormalizer).
 * 표지를 올리는 곳(등록·수정·자동 채우기·정리 화면)은 전부 여기를 거칠 것 — 하나라도 빠지면 카드 크기가 다시 들쭉날쭉해진다
 */
@Component
@RequiredArgsConstructor
public class MurderCoverStorage {

    private static final String S3_FOLDER = "murder-game";

    private final S3FileUtils s3FileUtils;
    private final CoverImageNormalizer normalizer;

    public String store(byte[] bytes, String contentType, String ext) {
        NormalizedImage normalized = normalizer.normalize(bytes);
        if (normalized != null) {
            return s3FileUtils.storeBytes(normalized.bytes(), normalized.contentType(), normalized.ext(), S3_FOLDER).getUrl();
        }
        // 읽지 못하는 형식이면 원본 그대로
        return s3FileUtils.storeBytes(bytes, contentType, ext, S3_FOLDER).getUrl();
    }

    public String store(RemoteImageFetcher.FetchedImage image) {
        return store(image.bytes(), image.contentType(), image.ext());
    }

    public String store(MultipartFile file) {
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            return s3FileUtils.storeFile(file, S3_FOLDER).getUrl();
        }
        NormalizedImage normalized = normalizer.normalize(bytes);
        if (normalized != null) {
            return s3FileUtils.storeBytes(normalized.bytes(), normalized.contentType(), normalized.ext(), S3_FOLDER).getUrl();
        }
        return s3FileUtils.storeFile(file, S3_FOLDER).getUrl();
    }

    public void delete(String url) {
        try {
            s3FileUtils.deleteFile(url);
        } catch (Exception ignore) {
            // S3 삭제 실패는 무시 (DB 정합성 우선)
        }
    }
}
