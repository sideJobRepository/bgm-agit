package com.bgmagitapi.service.response;

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
}
