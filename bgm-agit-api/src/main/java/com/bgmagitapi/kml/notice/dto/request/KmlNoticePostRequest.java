package com.bgmagitapi.kml.notice.dto.request;

import com.bgmagitapi.file.dto.request.FileRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class KmlNoticePostRequest {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;
    @NotBlank(message = "내용은 필수입니다..")
    private String cont;

    // CREATE 만 들어옴 (신규 글이라 DELETE/NORMAL 없음)
    private FileRequest files;
}
