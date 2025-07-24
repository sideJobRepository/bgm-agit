package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;


@Entity
@Table(name = "BGM_AGIT_URL_RESOURCES")
@Getter
public class BgmAgitUrlResources extends DateSuperClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_URL_RESOURCES_ID")
    private Long bgmAgitUrlResourcesId;
    
    @Column(name = "BGM_AGIT_URL_RESOURCES_PATH")
    private String bgmAgitUrlResourcesPath;
    
    @Column(name = "BGM_AGIT_URL_HTTP_METHOD")
    private String bgmAgitUrlHttpMethod;
}