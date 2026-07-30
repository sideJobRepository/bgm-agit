package com.bgmagitapi.kml.rating.entity;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Table(name = "BGM_AGIT_SEASON_STANDING")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class SeasonStanding extends DateSuperClass {

    // BGM 아지트 시즌 현황 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_SEASON_STANDING_ID")
    private Long id;

    // BGM 아지트 시즌 ID
    @JoinColumn(name = "BGM_AGIT_SEASON_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private Season season;

    // BGM 아지트 회원 ID
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private BgmAgitMember member;

    // BGM 아지트 시즌 현황 레이팅
    @Column(name = "BGM_AGIT_SEASON_STANDING_RATING")
    private BigDecimal rating;
}
