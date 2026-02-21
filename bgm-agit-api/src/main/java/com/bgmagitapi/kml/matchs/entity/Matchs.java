package com.bgmagitapi.kml.matchs.entity;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.setting.entity.Setting;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_MATCHS")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Matchs extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MATCHS_ID")
    private Long id;
    
    @JoinColumn(name = "BGM_AGIT_SETTING_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private Setting setting;
    
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private BgmAgitMember member;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_MATCHS_WIND")
    private MatchsWind wind;
    
    
    @Column(name = "BGM_AGIT_MATCHS_TOURNAMENT_STATUS")
    private String tournamentStatus;
    
    @Column(name = "BGM_AGIT_MATCHS_DEL_STATUS")
    private String delStatus;
    
    public void modify(MatchsWind wind, String tournamentStatus) {
        this.wind = wind;
        this.tournamentStatus = tournamentStatus;
    }
    
    public void modifyDelStatus() {
        this.delStatus = "Y";
    }
}
