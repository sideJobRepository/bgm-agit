package com.bgmagitapi.kml.rating.entity;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.fasterxml.jackson.databind.deser.DataFormatReaders;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Table(name = "BGM_AGIT_RATING")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Rating extends DateSuperClass {

    // BGM 아지트 레이팅 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_RATING_ID")
    private Long id;

    // BGM 아지트 시즌 ID
    @JoinColumn(name = "BGM_AGIT_SEASON_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private Season season;

    // BGM 아지트 대국 ID
    @JoinColumn(name = "BGM_AGIT_MATCHS_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private Matchs matchs;

    // BGM 아지트 회원 ID
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private BgmAgitMember member;

    // BGM 아지트 레이팅 값
    @Column(name = "BGM_AGIT_RATING_VALUE")
    private BigDecimal ratingValue;

    // BGM 아지트 레이팅 결과
    @Column(name = "BGM_AGIT_RATING_RESULT")
    private BigDecimal ratingResult;

    public static Rating create(Season season, Matchs matchs, BgmAgitMember member, BigDecimal ratingValue, BigDecimal ratingResult){
        return Rating.builder()
                .season(season)
                .matchs(matchs)
                .member(member)
                .ratingValue(ratingValue)
                .ratingResult(ratingResult)
                .build();
    }
}
