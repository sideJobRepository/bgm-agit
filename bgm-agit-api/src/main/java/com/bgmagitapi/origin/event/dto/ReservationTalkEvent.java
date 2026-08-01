package com.bgmagitapi.origin.event.dto;

import com.bgmagitapi.origin.service.response.ReservationTalkContext;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReservationTalkEvent {
    private TalkAction action;
    private ReservationTalkContext reservationTalkContext;
}
