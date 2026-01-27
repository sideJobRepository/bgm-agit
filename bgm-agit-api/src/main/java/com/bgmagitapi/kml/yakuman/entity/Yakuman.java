package com.bgmagitapi.kml.yakuman.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_YAKUMAN")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Yakuman extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_YAKUMAN_ID")
    private Long id;
    
    @Column(name = "BGM_AGIT_MEMBER_ID")
    private Long memberId;
    
    @Column(name = "BGM_AGIT_YAKUMAN_NAME")
    private String yakumanName;
    
    @Column(name = "BGM_AGIT_YAKUMAN_CONT")
    private String yakumanCont;
}
