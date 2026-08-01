package com.bgmagitapi.origin.event.dto;

import com.bgmagitapi.origin.entity.BgmAgitImage;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
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
