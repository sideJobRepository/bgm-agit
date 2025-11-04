package com.bgmagitapi.controller.response.notice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitMyPagePutRequest {
    
    private Long id;
    private String nickName;
    private String phoneNo;
    private String nickNameUseStatus;
}
