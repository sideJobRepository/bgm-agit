package com.bgmagitapi.origin.service.response;

import com.bgmagitapi.origin.entity.BgmAgitReservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 확정·취소 알림톡 발송 컨텍스트. 리스너가 @Async + AFTER_COMMIT 이라 영속성 컨텍스트 밖에서 읽힌다.
 * 그래서 방 이름·룸/마작 구분처럼 연관을 타야 하는 값은 여기서 미리 채워 둔다(지연 로딩 금지).
 * reservation 은 시작일·시간·인원·요청사항 같은 자기 컬럼만 읽는다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationTalkContext {
    
    private String role;
    private BgmAgitReservation reservation;
    private String memberName;
    private String label;
    private String phone;
    private boolean mahjong;
    
    public static ReservationTalkContext of(String role, BgmAgitReservation reservation, BizTalkCancel c) {
        return new ReservationTalkContext(
                role,
                reservation,
                c.getMemberName(),
                c.getLabel(),
                c.getMemberPhoneNo(),
                reservation.isMahjong()
        );
    }
}
