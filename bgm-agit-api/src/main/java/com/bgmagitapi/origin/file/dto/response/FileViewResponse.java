package com.bgmagitapi.origin.file.dto.response;

public record FileViewResponse(
        Long fileId,
        String fileName,
        String url
) {
}
