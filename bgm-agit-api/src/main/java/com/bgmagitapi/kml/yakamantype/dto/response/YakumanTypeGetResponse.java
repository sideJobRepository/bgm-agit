package com.bgmagitapi.kml.yakamantype.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class YakumanTypeGetResponse {

    private Long id;
    
    private String yakumanName;
    
    private Integer orders;
}
