package com.bgmagitapi.entity;


import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
@Table(name = "BGM_AGIT_MAIN_MENU")
public class BgmAgitMainMenu extends DateSuperClass {
    
    // BGM 아지트 메인 메뉴 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MAIN_MENU_ID")
    private Long bgmAgitMainMenuId;
    
    // BGM 아지트 서브 메뉴 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_SUB_MENU_ID")
    private BgmAgitMainMenu parentMenu;
    
    // BGM 아지트 영역 ID
    @Column(name = "BGM_AGIT_AREA_ID")
    private Long bgmAgitAreaId;
    
    // BGM 아지트 메뉴 이름
    @Column(name = "BGM_AGIT_MENU_NAME")
    private String bgmAgitMenuName;
    
    // BGM 아지트 메뉴 링크
    @Column(name = "BGM_AGIT_MENU_LINK")
    private String bgmAgitMenuLink;
    
    
    public Long getParentMenuId() {
        return parentMenu != null ? parentMenu.getBgmAgitMainMenuId() : null;
    }
}
