package com.bgmagitapi.kml.yakamantype.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_YAKUMAN_TYPE")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class YakumanType extends DateSuperClass {
    
    // BGM 아지트 역만 타입 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_YAKUMAN_TYPE_ID")
    private Long id;
    
    // BGM 아지트 역만 타입 이름
    @Column(name = "BGM_AGIT_YAKUMAN_TYPE_NAME")
    private String yakumanName;
    
    // BGM 아지트 역만 타입 순서
    @Column(name = "BGM_AGIT_YAKUMAN_TYPE_ORDERS")
    private Integer orders;
}
