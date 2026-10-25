package com.bgmagitapi.origin.clocktower.dto.request;

import lombok.Data;

@Data
public class ClockTowerSessionViewedRequest {
    private Long sessionId;
    private Integer version;
}
