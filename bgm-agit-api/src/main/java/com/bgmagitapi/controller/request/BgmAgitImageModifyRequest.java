package com.bgmagitapi.controller.request;

import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitImageModifyRequest {

    @NotNull(message = "이미지 ID를 넣어주세요")
    private Long bgmAgitImageId;
    @NotNull(message = "메인 메뉴 ID를 넣어주세요")
    private Long bgmAgitMainMenuId;
    @NotNull(message = "라벨을 넣어주세요")
    private String bgmAgitImageLabel;
    @NotNull(message = "카테고리를 넣어주세요")
    private BgmAgitImageCategory bgmAgitImageCategory;
    
    private String deletedFiles;
    
    private MultipartFile bgmAgitImage;
    
    private String bgmAgitMenuLink;
    
    private String bgmAgitImageGroups;
}
