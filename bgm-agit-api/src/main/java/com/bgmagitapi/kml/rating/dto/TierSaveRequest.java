package com.bgmagitapi.kml.rating.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TierSaveRequest {

    // 저장할 등급 목록 (기존 등급을 전부 덮어씀)
    @NotEmpty(message = "등급 목록은 비어있을 수 없습니다.")
    @Valid
    private List<TierItem> tiers;

    @JsonIgnore
    @AssertTrue(message = "등급 이름은 서로 중복될 수 없습니다.")
    public boolean isNamesDistinct() {
        if (tiers == null) {
            return true;
        }
        List<String> names = tiers.stream()
                .map(TierItem::getName)
                .filter(Objects::nonNull)
                .toList();
        return names.size() == names.stream().distinct().count();
    }

    @JsonIgnore
    @AssertTrue(message = "등급 최소 레이팅은 서로 중복될 수 없습니다.")
    public boolean isMinRatingsDistinct() {
        if (tiers == null) {
            return true;
        }
        List<Integer> minRatings = tiers.stream()
                .map(TierItem::getMinRating)
                .filter(Objects::nonNull)
                .toList();
        return minRatings.size() == minRatings.stream().distinct().count();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class TierItem {

        // 등급 이름
        @NotBlank(message = "등급 이름은 필수입니다.")
        private String name;

        // 등급 최소 레이팅
        @NotNull(message = "등급 최소 레이팅은 필수입니다.")
        @Positive(message = "등급 최소 레이팅은 0보다 커야 합니다.")
        private Integer minRating;
    }
}
