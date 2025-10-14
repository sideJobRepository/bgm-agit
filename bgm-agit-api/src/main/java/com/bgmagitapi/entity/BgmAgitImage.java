package com.bgmagitapi.entity;

import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.controller.request.BgmAgitImageCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitImageModifyRequest;
import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.util.StringUtils;

@Entity
@Table(name = "BGM_AGIT_IMAGE")
@Getter
@NoArgsConstructor
@DynamicUpdate
public class BgmAgitImage extends DateSuperClass {
    
    // BGM 아지트 이미지 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_IMAGE_ID")
    private Long bgmAgitImageId;
    
    // BGM 아지트 메인 메뉴 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MAIN_MENU_ID")
    private BgmAgitMainMenu bgmAgitMainMenu;
    
    // BGM 아지트 이미지 라벨
    @Column(name = "BGM_AGIT_IMAGE_LABEL")
    private String bgmAgitImageLabel;
    
    // BGM 아지트 메뉴 링크
    @Column(name = "BGM_AGIT_MENU_LINK")
    private String bgmAgitMenuLink;
    
    // BGM 아지트 이미지 그룹
    @Column(name = "BGM_AGIT_IMAGE_GROUPS")
    private String bgmAgitImageGroups;
    
    // BGM 아지트 이미지 카테고리
    @Column(name = "BGM_AGIT_IMAGE_CATEGORY")
    @Enumerated(EnumType.STRING)
    private BgmAgitImageCategory bgmAgitImageCategory;
    
    // BGM 아지트 이미지 URL
    @Column(name = "BGM_AGIT_IMAGE_URL")
    private String bgmAgitImageUrl;
    
    @Column(name = "BGM_AGIT_IMAGE_MIN_PEOPLE")
    private Integer bgmAgitImageMinPeople;
    
    @Column(name = "BGM_AGIT_IMAGE_MAX_PEOPLE")
    private Integer bgmAgitImageMaxPeople;
    
    
    public BgmAgitImage(BgmAgitMainMenu bgmAgitMainMenu, BgmAgitImageCreateRequest request, UploadResult image) {
        this.bgmAgitMainMenu = bgmAgitMainMenu;
        this.bgmAgitImageLabel = request.getBgmAgitImageLabel();
        this.bgmAgitImageGroups = request.getBgmAgitImageGroups();
        this.bgmAgitImageCategory = request.getBgmAgitImageCategory();
        this.bgmAgitMenuLink = request.getBgmAgitMenuLink();
        this.bgmAgitImageUrl = image.getUrl();
    }
    
    public void modifyBgmAgitImage(BgmAgitImageModifyRequest request, UploadResult image) {
        if (request.getBgmAgitImageCategory() != null) {
            this.bgmAgitImageCategory = request.getBgmAgitImageCategory();
        }
        if (StringUtils.hasText(request.getBgmAgitMenuLink())) {
            this.bgmAgitMenuLink = request.getBgmAgitMenuLink();
        }
        if (StringUtils.hasText(request.getBgmAgitImageGroups())) {
            this.bgmAgitImageGroups = request.getBgmAgitImageGroups();
        }
        if (image != null && StringUtils.hasText(image.getUrl())) {
            this.bgmAgitImageUrl = image.getUrl();
        }
        if (StringUtils.hasText(request.getBgmAgitImageLabel())) {
            this.bgmAgitImageLabel = request.getBgmAgitImageLabel();
        }
    }
}
