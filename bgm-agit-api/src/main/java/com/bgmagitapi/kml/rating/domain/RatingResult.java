package com.bgmagitapi.kml.rating.domain;


import com.bgmagitapi.kml.record.entity.Record;

import java.math.BigDecimal;

public record RatingResult (Item first, Item second, Item third, Item fourth){

    public Item getByRank(int rank) {
        return switch (rank) {
            case 1 -> first;
            case 2 -> second;
            case 3 -> third;
            case 4 -> fourth;
            default -> throw new IllegalArgumentException("지원하지 않는 등수입니다. rank=" + rank);
        };
    }

    public record Item(
        Record record, BigDecimal ratingValue
    ){}
}
