package com.bgmagitapi.kml.menurole.entity;

import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.kml.menu.entity.KmlMenu;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_KML_MENU_ROLE")
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class KmlMenuRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_KML_MENU_ROLE_ID")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_ROLE_ID")
    private BgmAgitRole role;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_KML_MENU_ID")
    private KmlMenu menu;
}
