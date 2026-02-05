package com.bgmagitapi.kml.history.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.history.enums.ChangeType;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "BGM_AGIT_MATCHS_HISTORY")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class MatchsHistory extends DateSuperClass {


    // BGM 아지트 대국 이력 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MATCHS_HISTORY_ID")
    private Long id;

    // BGM 아지트 대국 ID
    
    @Column(name = "BGM_AGIT_MATCHS_ID")
    private Long matchsId;

    // BGM 아지트 설정 ID
    @Column(name = "BGM_AGIT_SETTING_ID")
    private Long settingId;

    // BGM 아지트 회원 ID
    @Column(name = "BGM_AGIT_MEMBER_ID")
    private Long memberId;

    // BGM 아지트 대국 바람
    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_MATCHS_WIND")
    private MatchsWind wind;

    // BGM 아지트 대국 대회 여부
    @Column(name = "BGM_AGIT_MATCHS_TOURNAMENT_STATUS")
    private String tournamentStatus;

    // BGM 아지트 대국 삭제 여부
    @Column(name = "BGM_AGIT_MATCHS_DEL_STATUS")
    private String delStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "BGM_AGIT_MATCHS_HISTORY_CHANGE_TYPE")
    private ChangeType changeType;

    // BGM 아지트 대국 이력 변경 사유
    @Column(name = "BGM_AGIT_MATCHS_HISTORY_CHANGE_REASON")
    private String changeReason;
}
