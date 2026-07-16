package com.bgmagitapi.origin.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MatchRecordRegisteredEvent {

    private final Long matchsId;
}
