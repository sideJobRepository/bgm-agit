package com.bgmagitapi.origin.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 권한관리 "월간패스" 탭 목록 한 줄. 소셜·자체로그인 전체 회원이 대상이다.
 * 권한 목록(BgmAgitRoleResponse)과 달리 역할 조인이 없어 회원 1명 = 1행이다.
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class BgmAgitMonthlyPassResponse {

    private Long memberId;
    private String memberName;
    private String memberNickname;
    private String memberPhoneNo;
    private String memberLoginType;
    // 'Y' = 이번 달 월간패스 회원. 매월 1일 0시에 일괄 'N'
    private String monthlyPassStatus;
}
