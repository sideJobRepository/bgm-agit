package com.bgmagitapi.service.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BizTalkResponse {
    
    private String responseCode;
    private String meg;
}
