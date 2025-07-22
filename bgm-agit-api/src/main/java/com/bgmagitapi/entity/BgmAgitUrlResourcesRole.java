package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "BGM_AGIT_URL_RESOURCES_ROLE")
@Getter
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
    
}
