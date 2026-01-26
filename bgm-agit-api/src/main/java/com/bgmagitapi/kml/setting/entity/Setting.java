package com.bgmagitapi.kml.setting.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_SETTING")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Setting extends DateSuperClass {
    
    // BGM 아지트 설정 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_SETTING_ID")
    private Long id;
    
    // BGM 아지트 설정 반환
    @Column(name = "BGM_AGIT_SETTING_TURNING")
    private Integer turning;
    
    // BGM 아지트 설정 1등 우마
    @Column(name = "BGM_AGIT_SETTING_FIRST_UMA")
    private Integer firstUma;
    
    // BGM 아지트 설정 2등 우마
    @Column(name = "BGM_AGIT_SETTING_SECOND_UMA")
    private Integer secondUma;
    
    // BGM 아지트 설정 3등 우마
    @Column(name = "BGM_AGIT_SETTING_THIRD_UMA")
    private Integer thirdUma;
    
    // BGM 아지트 설정 4등 우마
    @Column(name = "BGM_AGIT_SETTING_FOUR_UMA")
    private Integer fourUma;
    
    // BGM 아지트 설정 사용 여부
    @Column(name = "BGM_AGIT_SETTING_USE_STATUS")
    private String useStatus;
}
