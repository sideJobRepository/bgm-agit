package com.bgmagitapi.kml.notice.dto.request;

import com.bgmagitapi.file.dto.request.FileRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KmlNoticePutRequest {

    @NotNull(message = "공지사항 id는 필수입니다.")
    private Long id;
    @NotBlank(message = "제목은 필수입니다.")
    private String title;
    @NotBlank(message = "내용은 필수입니다.")
    private String cont;

    // CREATE/DELETE/NORMAL 혼합 가능 (수정 시 새 첨부 + 기존 일부 삭제 + 기존 유지)
    private FileRequest files;
}
