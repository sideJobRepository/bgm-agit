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
public class BgmAgitImageCreateRequest {
    
    @NotNull(message = "메인 메뉴 ID를 넣어주세요")
    private Long bgmAgitMainMenuId;
    @NotNull(message = "라벨을 넣어주세요")
    private String bgmAgitImageLabel;
    
    private String bgmAgitMenuLink;
    
    private String bgmAgitImageGroups;
    @NotNull(message = "카테고리를 넣어주세요")
    private BgmAgitImageCategory  bgmAgitImageCategory;
    @NotNull(message = "이미지를 넣어주세요")
    private MultipartFile bgmAgitImage;
}
