package com.bgmagitapi.kml.record.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_RECORD")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    
    @Column(name = "BGM_AGIT_RECORD_RANK")
    private Integer recordRank;
    
    @Column(name = "BGM_AGIT_RECORD_SCORE")
    private Integer recordScore;
    
    @Column(name = "BGM_AGIT_RECORD_POINT")
    private Double recordPoint;
    
    @Column(name = "BGM_AGIT_RECORD_SEAT")
    private String recordSeat;
    
    @Column(name = "BGM_AGIT_RECORD_TOURNAMENT_STATUS")
    private String tournamentStatus;
}
