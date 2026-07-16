package com.bgmagitapi.origin.event.dto;

import lombok.Getter;

@Getter
public class KmlRecordRestoreEvent {

    private final Long kmlRecordId;

    public KmlRecordRestoreEvent(Long kmlRecordId) {
        this.kmlRecordId = kmlRecordId;
    }
}
