package com.bgmagitapi.kml.rating.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Table(name = "BGM_AGIT_TIER")
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Builder
public class Tier extends DateSuperClass {

    // BGM 아지트 등급 ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_TIER_ID")
    private Long id;

    // BGM 아지트 시즌 ID
    @JoinColumn(name = "BGM_AGIT_SEASON_ID")
    @ManyToOne(fetch = FetchType.LAZY)
    private Season season;

    // BGM 아지트 등급 이름
    @Column(name = "BGM_AGIT_TIER_NAME")
    private String name;

    // BGM 아지트 등급 최소 레이팅
    @Column(name = "BGM_AGIT_TIER_MIN_RATING")
    private Integer minRating;

    public boolean isReachedBy(BigDecimal rating){
        BigDecimal minRating = BigDecimal.valueOf(this.minRating);
        return minRating.compareTo(rating) <= 0;
    }

    public BigDecimal pointsToReach(BigDecimal rating){
        BigDecimal minRating = BigDecimal.valueOf(this.minRating);
        return minRating.subtract(rating).max(BigDecimal.ZERO);
    }
}
