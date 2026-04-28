package com.bgmagitapi.file.dto.request;

import java.util.List;

public record FileZipDownloadRequest(List<Long> ids, String name) {
}
