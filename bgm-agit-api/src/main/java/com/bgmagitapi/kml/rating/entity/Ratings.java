package com.bgmagitapi.kml.rating.entity;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Ratings는 List<Rating> 를 다루는 일급객체.
 * jpa entity가 아님
 */
public class Ratings {

    private final List<Rating> ratings;

    public Ratings(List<Rating> ratings) {
        this.ratings = ratings;
    }

    public int size(){
        return ratings.size();
    }

    public Optional<Rating> getSeasonHigh(){
        return ratings.stream()
                .max(Comparator.comparing(Rating::getRatingResult));
    }

    public Optional<Rating> getSeasonLow(){
        return ratings.stream()
                .min(Comparator.comparing(Rating::getRatingResult));
    }

    public List<Rating> getRecent(int count){
        return ratings.stream()
                .sorted(Comparator.comparing(Rating::getRegistDate).reversed())
                .limit(count)
                .toList();
    }


}
