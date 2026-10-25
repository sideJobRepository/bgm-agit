package com.bgmagitapi.origin.clocktower.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ClockTowerSessionCreateRequest {
    private Long gameId;
    private List<ClockTowerSessionSeatInput> seats;
}
