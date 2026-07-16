package com.bgmagitapi.origin.event.dto;

import lombok.Getter;

@Getter
public class KmlRecordDeleteEvent {

    private final Long kmlRecordId;

    public KmlRecordDeleteEvent(Long kmlRecordId) {
        this.kmlRecordId = kmlRecordId;
    }
}
