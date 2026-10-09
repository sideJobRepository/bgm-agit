package com.bgmagitapi.origin.service.response;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BizTalkCancel {
    
    private String memberName;
    private String label;
    private String memberPhoneNo;
    private String approvalStatus;

    /**
     * 알림톡 수신자·방 이름·<b>변경 전</b> 승인상태. 상태를 바꾸기 전에 만들어야 한다
     * (modifyReservation 이 "대기 → 확정" 전환인지를 이 approvalStatus 로 판단한다).
     * 합쳐 예약이면 방 이름이 "M-1, M-2" 로 합쳐진다.
     */
    public static BizTalkCancel from(BgmAgitReservation reservation) {
        BgmAgitMember member = reservation.getBgmAgitMember();
        return new BizTalkCancel(
                member == null ? null : member.getBgmAgitMemberName(),
                reservation.getRoomNames(),
                member == null ? null : member.getBgmAgitMemberPhoneNo(),
                reservation.getBgmAgitReservationApprovalStatus()
        );
    }
}
