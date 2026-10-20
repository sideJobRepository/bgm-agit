package com.bgmagitapi.origin.event.dto;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import lombok.AllArgsConstructor;
import lombok.Data;

/** 예약 등록(대기) 알림톡. reservation 은 방이 채워진 상태로 넘긴다(비동기 리스너가 읽는다). */
@AllArgsConstructor
@Data
public class ReservationWaitingEvent {
    BgmAgitMember bgmAgitMember;
    BgmAgitReservation reservation;
}
