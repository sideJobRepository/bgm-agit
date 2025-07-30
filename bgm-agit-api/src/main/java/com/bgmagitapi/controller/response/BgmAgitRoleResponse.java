package com.bgmagitapi.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitRoleResponse {
    
    Long memberId;
    Long roleId;
    String memberName;
    String roleName;
    String memberEmail;
}
