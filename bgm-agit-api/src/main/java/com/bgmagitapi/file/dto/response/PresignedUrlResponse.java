package com.bgmagitapi.file.dto.response;

public record PresignedUrlResponse(
        String url,
        String objectKey,
        String fileName,
        String bucketName,
        String contentType
) {
}
