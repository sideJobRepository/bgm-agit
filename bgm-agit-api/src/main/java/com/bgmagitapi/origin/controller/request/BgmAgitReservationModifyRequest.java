package com.bgmagitapi.origin.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitReservationModifyRequest {
    
    
    private Long reservationId;
    
    private String cancelStatus;
    
    private String approvalStatus;

}
