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


@Data
@NoArgsConstructor
@AllArgsConstructor
public class BgmAgitNoticeModifyRequest {
    @NotNull(message = "공지사항 ID는 필수입니다.")
    private Long bgmAgitNoticeId;
    
    // BGM 아지트 공지사항 제목
    @NotBlank(message = "제목을 입력해 주세요")
    private String bgmAgitNoticeTitle;
    
    // BGM 아지트 공지사항 내용
    @NotBlank(message = "내용을 입력해주세요")
    private String bgmAgitNoticeCont;
    
    // BGM 아지트 공지사항 타입
    @NotNull(message = "공지 유형을 선택해주세요.")
    private BgmAgitNoticeType bgmAgitNoticeType;
    
    private String popupUseStatus;
    
    private List<String> deletedFiles;
    
    private List<MultipartFile> multipartFiles;
    
    public List<MultipartFile> getMultipartFiles() {
        if(this.multipartFiles == null) {
            this.multipartFiles = new ArrayList<>();
        }
        return this.multipartFiles;
    }
    
    public List<String> getDeletedFiles() {
        if(this.deletedFiles == null) {
            this.deletedFiles = new ArrayList<>();
        }
        return this.deletedFiles;
    }
}
