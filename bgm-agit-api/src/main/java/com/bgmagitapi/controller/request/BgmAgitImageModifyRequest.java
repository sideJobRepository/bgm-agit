package com.bgmagitapi.controller.request;

import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@NotNull
@Data
public class BgmAgitImageModifyRequest {

    @NotNull(message = "이미지 ID를 넣어주세요")
    private Long bgmAgitImageId;
    @NotNull(message = "메인 메뉴 ID를 넣어주세요")
    private Long bgmAgitMainMenuId;
    
    @NotNull(message = "라벨을 넣어주세요")
    private String bgmAgitImageLabel;
    @NotBlank(message = "메뉴 링크를 넣어주세요")
    private String bgmAgitMenuLink;
    @NotBlank(message = "이미지 그룹을 넣어주세요")
    private String bgmAgitImageGroups;
    @NotNull(message = "카테고리를 넣어주세요")
    private BgmAgitImageCategory bgmAgitImageCategory;
    @NotBlank(message = "이미지 Url을 넣어주세요")
    private String bgmAgitImageUrl;
}
