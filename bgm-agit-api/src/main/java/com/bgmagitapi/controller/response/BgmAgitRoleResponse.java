package com.bgmagitapi.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitRoleResponse {
    
    private Long memberId;
    private Long roleId;
    private String memberName;
    private String roleName;
    private String memberEmail;
    private String memberPhoneNo;
    private String memberLoginType;
}
