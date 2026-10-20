package com.bgmagitapi.origin.service.response;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 예약 확정·취소 알림톡 발송 정보.
 *
 * 리스너가 @Async + AFTER_COMMIT 이라 다른 스레드에서 읽힌다. 그래서 reservation 은 반드시
 * 회원·방까지 fetch join 으로 초기화된 엔티티여야 한다(findReservationWithRooms).
 * 이름·라벨·전화번호는 만들 때 미리 뽑아 둔다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationTalkContext {

    private String role;
    private BgmAgitReservation reservation;
    private String memberName;
    // 방 이름. 합쳐 예약이면 "M-1, M-2"
    private String label;
    private String phone;

    public static ReservationTalkContext of(String role, BgmAgitReservation reservation) {
        BgmAgitMember member = reservation.getBgmAgitMember();
        return new ReservationTalkContext(
                role,
                reservation,
                member == null ? null : member.getBgmAgitMemberName(),
                reservation.getRoomNames(),
                member == null ? null : member.getBgmAgitMemberPhoneNo()
        );
    }
}
