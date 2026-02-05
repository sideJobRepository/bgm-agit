package com.bgmagitapi.kml.history.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.record.enums.Wind;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_RECORD_HISTORY")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class RecordHistory extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RECORD_HISTORY_ID")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MATCHS_HISTORY_ID")
    private MatchsHistory matchsHistory;
    
    @Column(name = "BGM_AGIT_RECORD_ID")
    private Long recordId;
    
    @Column(name = "BGM_AGIT_MEMBER_ID")
    private Long memberId;
    
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
