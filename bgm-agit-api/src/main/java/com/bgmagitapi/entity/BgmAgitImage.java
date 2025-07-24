package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "BGM_AGIT_IMAGE")
@Getter
@NoArgsConstructor
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
    
    @Column(name = "BGM_AGIT_IMAGE_GROUPS")
    // BGM 아지트 이미지 그룹
    private String bgmAgitImageGroups;
    
    // BGM 아지트 이미지 URL
    @Column(name = "BGM_AGIT_IMAGE_URL")
    private String bgmAgitImageUrl;
    
}
