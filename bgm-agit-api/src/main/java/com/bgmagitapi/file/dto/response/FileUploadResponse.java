package com.bgmagitapi.file.dto.response;

import com.bgmagitapi.file.entity.BgmAgitFile;

public record FileUploadResponse(
        Long fileId,
        String fileName,
        Integer fileSize,
        String contentType,
        String objectKey,
        String bucketName
) {
    public static FileUploadResponse from(BgmAgitFile file) {
        return new FileUploadResponse(
                file.getId(),
                file.getFileName(),
                file.getFileSize(),
                file.getFileContentType(),
                file.getFilePath(),
                file.getBucketName()
        );
    }
}
