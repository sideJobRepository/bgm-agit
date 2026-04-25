package com.bgmagitapi.event.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class KmlRecordSubmitEvent {

    private final int gameLength;
    private final int commonPoint;
    private final List<Player> players;

    public KmlRecordSubmitEvent(int gameLength, int commonPoint, List<Player> players) {
        this.gameLength = gameLength;
        this.commonPoint = commonPoint;
        this.players = players;
    }

    public record Player(Long userId, int point, int wind) {
    }
}
