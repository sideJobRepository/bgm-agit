package com.bgmagitapi.kml.rating.domain;

import com.bgmagitapi.kml.record.entity.Record;

import java.math.BigDecimal;

public record RatingEntry(Record record, BigDecimal currentRating) {
}
