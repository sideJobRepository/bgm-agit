package com.bgmagitapi.event.dto;

import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@AllArgsConstructor
@Data
public class ReservationWaitingEvent {
    BgmAgitMember bgmAgitMember;
    BgmAgitImage bgmAgitImage;
    List<BgmAgitReservation> list;
}
