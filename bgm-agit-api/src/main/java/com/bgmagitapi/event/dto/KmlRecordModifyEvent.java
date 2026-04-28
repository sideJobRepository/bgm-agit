package com.bgmagitapi.event.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class KmlRecordModifyEvent {

    private final Long modifyId;
    private final int gameLength;
    private final int commonPoint;
    private final List<KmlRecordSubmitEvent.Player> players;

    public KmlRecordModifyEvent(Long modifyId, int gameLength, int commonPoint, List<KmlRecordSubmitEvent.Player> players) {
        this.modifyId = modifyId;
        this.gameLength = gameLength;
        this.commonPoint = commonPoint;
        this.players = players;
    }
}
