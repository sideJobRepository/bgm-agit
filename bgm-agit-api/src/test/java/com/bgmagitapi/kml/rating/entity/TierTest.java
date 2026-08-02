package com.bgmagitapi.kml.rating.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

class TierTest {

    private Tier tierWithMinRating(int minRating) {
        return Tier.builder()
                .minRating(minRating)
                .build();
    }

    @Test
    @DisplayName("레이팅이 최소 레이팅과 같으면 티어에 도달한다.")
    void isReachedBy_equal_returnsFalse() {
        Tier tier = tierWithMinRating(1500);

        assertThat(tier.isReachedBy(BigDecimal.valueOf(1500))).isTrue();
    }

    @Test
    @DisplayName("레이팅이 최소 레이팅보다 크면 티어에 도달한다")
    void isReachedBy_greater_returnsTrue() {
        Tier tier = tierWithMinRating(1500);

        assertThat(tier.isReachedBy(BigDecimal.valueOf(1501))).isTrue();
    }

    @Test
    @DisplayName("레이팅이 최소 레이팅보다 작으면 티어에 도달하지 못한다")
    void isReachedBy_less_returnsFalse() {
        Tier tier = tierWithMinRating(1500);

        assertThat(tier.isReachedBy(BigDecimal.valueOf(1499))).isFalse();
    }
}
