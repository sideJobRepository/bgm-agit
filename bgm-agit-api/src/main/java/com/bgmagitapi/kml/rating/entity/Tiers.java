package com.bgmagitapi.kml.rating.entity;


import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Tiers는 List<Tier> 를 다루는 일급객체.
 * jpa entity가 아님
 */
public class Tiers {

    private final List<Tier> sortedTiers;

    public Tiers(List<Tier> tiers) {
        this.sortedTiers = tiers.stream()
                .sorted(Comparator.comparing(Tier::getMinRating).reversed())
                .toList();
    }

    public Tier getTierBy(BigDecimal rating) {
        for (Tier tier : sortedTiers) {
            if (tier.isReachedBy(rating))
                return tier;
        }
        throw new RuntimeException("해당 점수에 정의된 tier가 존재하지 않습니다. rating=" + rating);
    }

    public Optional<Tier> getNextTier(Tier tier) {
        int index = indexOf(tier);
        boolean isHighestTier = (index == 0);
        if (isHighestTier)
            return Optional.empty();

        return Optional.of(sortedTiers.get(index - 1));
    }

    private int indexOf(Tier tier) {
        for (int i = 0; i < sortedTiers.size(); i++) {
            if (sortedTiers.get(i).getId().equals(tier.getId()))
                return i;
        }
        throw new IllegalArgumentException("정의되지 않은 tier 입니다. tierId=" + tier.getId());
    }
}
