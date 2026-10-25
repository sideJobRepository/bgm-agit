package com.bgmagitapi.origin.clocktower.dto.request;

import lombok.Data;

import java.util.List;

/** 바뀐 좌석만 보낸다. 없던 회원이면 좌석을 새로 만든다(중간에 들어온 여행자 등) */
@Data
public class ClockTowerSessionSeatsRequest {
    private List<ClockTowerSessionSeatInput> seats;
}
