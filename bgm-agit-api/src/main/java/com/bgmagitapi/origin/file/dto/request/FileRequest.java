package com.bgmagitapi.origin.file.dto.request;

import com.bgmagitapi.origin.file.enums.FileProcessStatus;
import com.bgmagitapi.origin.file.enums.FileType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 도메인 저장/수정 시 첨부 파일 변경 의도를 묶어 보내는 DTO.
 *
 * fileProcessStatus 별 처리:
 * - CREATE: 새 파일 (TEMPORARY → COMPLETE 로 승격, targetId 부여)
 * - DELETE: 기존 파일 분리 (COMPLETE → TEMPORARY 로 되돌림, 일일 배치가 청소)
 * - NORMAL: 유지 (서버 측 처리 없음)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileRequest {

    private FileType fileType;
    private List<FileChangeRequest> files;

    public List<FileChangeRequest> getFiles() {
        if (this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class FileChangeRequest {
        private Long id;
        private String fileName;
        private String objectKey;
        private String contentType;
        private String bucketName;
        private Integer fileSize;
        private FileProcessStatus fileProcessStatus;
    }
}
