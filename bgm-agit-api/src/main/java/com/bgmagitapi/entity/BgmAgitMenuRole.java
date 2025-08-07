package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "BGM_AGIT_MENU_ROLE")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitMenuRole extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MENU_ROLE_ID")
    private Long bgmAgitMenuRoleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_ROLE_ID")
    private BgmAgitRole bgmAgitRole;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MAIN_MENU_ID")
    private BgmAgitMainMenu bgmAgitMainMenu;
}
