package com.bgmagitapi.origin.event.dto;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * 예약 대기(등록) 알림톡 이벤트. 리스너가 @Async + AFTER_COMMIT 이라 지연 로딩이 안 되므로
 * 회원·방은 서비스에서 이미 로딩한 엔티티를 그대로 넘긴다(rooms 는 기준 방이 첫 번째).
 */
@AllArgsConstructor
@Data
public class ReservationWaitingEvent {
    BgmAgitMember bgmAgitMember;
    BgmAgitReservation reservation;
    List<BgmAgitRoom> rooms;
}
