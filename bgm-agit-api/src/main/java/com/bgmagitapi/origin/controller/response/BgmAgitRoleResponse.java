package com.bgmagitapi.origin.controller.response;

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
    private String memberNickname;
    private String roleName;
    private String memberEmail;
    private String memberPhoneNo;
    private String memberLoginType;
    private String mahjongUseStatus; // 'Y' = 마작(BML) 기록 이용/연동 회원. 자체로그인 탭에서 연동 여부 표시용
}
