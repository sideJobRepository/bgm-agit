package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "BGM_AGIT_URL_RESOURCES_ROLE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitUrlResourcesRole extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_URL_RESOURCES_ROLE_ID")
    private Long bgmAgitUrlResourcesRoleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_ROLE_ID")
    private BgmAgitRole bgmAgitRole;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_URL_RESOURCES_ID")
    private BgmAgitUrlResources bgmAgitUrlResources;

    public static BgmAgitUrlResourcesRole create(BgmAgitRole role, BgmAgitUrlResources resources) {
        BgmAgitUrlResourcesRole resourcesRole = new BgmAgitUrlResourcesRole();
        resourcesRole.bgmAgitRole = role;
        resourcesRole.bgmAgitUrlResources = resources;
        return resourcesRole;
    }
    
}
