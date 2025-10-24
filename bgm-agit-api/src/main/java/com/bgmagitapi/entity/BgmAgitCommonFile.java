package com.bgmagitapi.entity;


import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;
import software.amazon.awssdk.core.pagination.sync.PaginatedResponsesIterator;

@Table(name = "BGM_AGIT_COMMON_FILE")
@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class BgmAgitCommonFile extends DateSuperClass {

    // BGM 아지트 공통 파일 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_COMMON_FILE_ID")
    private Long bgmAgitCommonFileId;

    // BGM 아지트 공통 파일 타겟 ID
    @Column(name = "BGM_AGIT_COMMON_FILE_TARGET_ID")
    private Long bgmAgitCommonFileTargetId;

    // BGM 아지트 공통 파일 이름
    @Column(name = "BGM_AGIT_COMMON_FILE_NAME")
    private String bgmAgitCommonFileName;

    // BGM 아지트 공통 파일 UUID 이름
    @Column(name = "BGM_AGIT_COMMON_FILE_UUID_NAME")
    private String bgmAgitCommonFileUuidName;
    
    // BGM 아지트 공통 파일 URL
    @Column(name = "BGM_AGIT_COMMON_FILE_URL")
    private String bgmAgitCommonFileUrl;
    
    // BGM 아지트 공통 파일 타입
    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_COMMON_FILE_TYPE")
    private BgmAgitCommonType bgmAgitCommonFileType;
}
