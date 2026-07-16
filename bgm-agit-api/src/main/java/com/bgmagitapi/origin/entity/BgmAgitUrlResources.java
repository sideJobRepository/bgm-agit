package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "BGM_AGIT_URL_RESOURCES")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitUrlResources extends DateSuperClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_URL_RESOURCES_ID")
    private Long bgmAgitUrlResourcesId;
    
    @Column(name = "BGM_AGIT_URL_RESOURCES_PATH")
    private String bgmAgitUrlResourcesPath;
    
    @Column(name = "BGM_AGIT_URL_HTTP_METHOD")
    private String bgmAgitUrlHttpMethod;

    public static BgmAgitUrlResources create(String path, String httpMethod) {
        BgmAgitUrlResources resources = new BgmAgitUrlResources();
        resources.bgmAgitUrlResourcesPath = path;
        resources.bgmAgitUrlHttpMethod = httpMethod;
        return resources;
    }
}
