package com.bgmagitapi.controller.request;

import com.bgmagitapi.entity.enumeration.BgmAgitNoticeType;
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
    private Long bgmAgitNoticeId;
    
    // BGM 아지트 공지사항 제목
    private String bgmAgitNoticeTitle;
    
    // BGM 아지트 공지사항 내용
    private String bgmAgitNoticeCont;
    
    // BGM 아지트 공지사항 타입
    private BgmAgitNoticeType bgmAgitNoticeType;
    
    private List<MultipartFile> multipartFiles;
    
    public List<MultipartFile> getMultipartFiles() {
        if(this.multipartFiles == null) {
            this.multipartFiles = new ArrayList<>();
        }
        return this.multipartFiles;
    }
}
