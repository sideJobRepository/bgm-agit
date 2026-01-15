package com.bgmagitapi.kml.menu.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "BGM_AGIT_KML_MENU")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class KmlMenu extends DateSuperClass {

    
    // BGM 아지트 KML 메뉴 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_KML_MENU_ID")
    private Long id;

    // BGM 아지트 KML 메뉴 이름
    @Column(name = "BGM_AGIT_KML_MENU_NAME")
    private String menuName;

    // BGM 아지트 KML 메뉴 링크
    @Column(name = "BGM_AGIT_KML_MENU_LINK")
    private String menuLink;

    // BGM 아지트 KML 메뉴 순서
    @Column(name = "BGM_AGIT_KML_MENU_ORDERS")
    private Integer orders;

    // BGM 아지트 KML 아이콘
    @Column(name = "BGM_AGIT_KML_ICON")
    private String icon;

}
