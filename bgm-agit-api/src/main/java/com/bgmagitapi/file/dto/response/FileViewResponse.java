package com.bgmagitapi.file.dto.response;

public record FileViewResponse(
        Long fileId,
        String fileName,
        String url
) {
}
