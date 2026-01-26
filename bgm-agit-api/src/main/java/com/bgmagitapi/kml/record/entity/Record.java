package com.bgmagitapi.kml.record.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.enums.Wind;
import com.bgmagitapi.kml.setting.entity.Setting;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "BGM_AGIT_RECORD")
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class Record extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RECORD_ID")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MATCHS_ID")
    private Matchs matchs;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember member;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_SETTING_ID")
    private Setting setting;
    
    @Column(name = "BGM_AGIT_RECORD_RANK")
    private Integer recordRank;
    
    @Column(name = "BGM_AGIT_RECORD_SCORE")
    private Integer recordScore;
    
    @Column(name = "BGM_AGIT_RECORD_POINT")
    private Double recordPoint;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_RECORD_SEAT")
    private Wind recordSeat;
    
}
