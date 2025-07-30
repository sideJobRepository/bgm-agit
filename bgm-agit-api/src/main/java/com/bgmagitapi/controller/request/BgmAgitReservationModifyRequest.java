package com.bgmagitapi.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitReservationModifyRequest {
    
    
    private Long reservationNo;
    
    private String cancelStatus;
    

}
