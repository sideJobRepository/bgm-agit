package com.bgmagitapi.controller.request;

import com.bgmagitapi.entity.enumeration.BgmAgitNoticeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitNoticeCreateRequest {
    
    @NotBlank(message = "제목을 입력해 주세요")
    private String bgmAgitNoticeTitle;
    @NotBlank(message = "내용을 입력해주세요")
    private String bgmAgitNoticeContent;
    @NotNull(message = "공지 유형을 선택해주세요.")
    private BgmAgitNoticeType  bgmAgitNoticeType;
    private String popupUseStatus;
    private List<MultipartFile> files;
    
    public List<MultipartFile> getFiles() {
        if (this.files == null) {
            this.files = new ArrayList<>();
        }
        return this.files;
    }
}
