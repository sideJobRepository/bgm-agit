package com.bgmagitapi.kml.matchs.entity;

import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_MATCHS")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Matchs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MATCHS_ID")
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_MATCHS_WIND")
    private MatchsWind wind;
    
    
    @Column(name = "BGM_AGIT_RECORD_TOURNAMENT_STATUS")
    private String tournamentStatus;
}
