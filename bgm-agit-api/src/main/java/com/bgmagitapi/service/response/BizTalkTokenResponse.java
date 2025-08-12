package com.bgmagitapi.service.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BizTalkTokenResponse {
    private String responseCode;
    private String token;
    private String msg;
    private String expireDate;
    
    public BizTalkTokenResponse(String token, String expireDate) {
        this.token = token;
        this.expireDate = expireDate;
    }
}
