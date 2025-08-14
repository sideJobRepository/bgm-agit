package com.bgmagitapi.service.response;

import com.bgmagitapi.entity.BgmAgitReservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationTalkContext {
    
    private String role;
    private List<BgmAgitReservation> reservations;
    private String memberName;
    private String label;
    private String phone;
    
    public static ReservationTalkContext of(
            String role, List<BgmAgitReservation> list, BizTalkCancel c
    ) {
        return new ReservationTalkContext(
                role,
                list,
                c.getMemberName(),
                c.getLabel(),
                c.getMemberPhoneNo()
        );
    }
}