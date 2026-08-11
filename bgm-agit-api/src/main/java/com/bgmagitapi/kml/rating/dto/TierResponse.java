package com.bgmagitapi.kml.rating.dto;

import com.bgmagitapi.kml.rating.entity.Tier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TierResponse {

    private Long id;          // 등급 ID
    private Long seasonId;    // 시즌 ID
    private String name;      // 등급 이름
    private String image;     // 등급 배지 이미지 (data URI base64)
    private String color;     // 등급 색상 (HEX)
    private Integer minRating; // 등급 최소 레이팅

    public static TierResponse fromDomain(Tier tier) {
        return TierResponse.builder()
                .id(tier.getId())
                .seasonId(tier.getSeason() != null ? tier.getSeason().getId() : null)
                .name(tier.getName())
                .image(tier.getImage())
                .color(tier.getColor())
                .minRating(tier.getMinRating())
                .build();
    }
}
