package com.bgmagitapi.kml.record.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.record.enums.Wind;
import jakarta.persistence.*;
import lombok.*;

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
    
    
    @Column(name = "BGM_AGIT_RECORD_RANK")
    private Integer recordRank;
    
    @Column(name = "BGM_AGIT_RECORD_SCORE")
    private Integer recordScore;
    
    @Column(name = "BGM_AGIT_RECORD_POINT")
    private Double recordPoint;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_RECORD_SEAT")
    private Wind recordSeat;
    
    public void modify(RecordPutRequest.Records dto, Double point, BgmAgitMember bgmAgitMember) {
        this.recordScore = dto.getRecordScore();
        this.recordRank = dto.getRecordRank();
        this.recordPoint = point;
        this.member = bgmAgitMember;
        this.recordSeat = dto.getRecordSeat();
    }
    
    public String toFormattedString(String nickname) {
        String point = "(승점:" + this.recordPoint + ")";
        return String.format("[%s]%s: %d %s", recordSeat.getValue(), nickname, recordScore, point);
    }
}
