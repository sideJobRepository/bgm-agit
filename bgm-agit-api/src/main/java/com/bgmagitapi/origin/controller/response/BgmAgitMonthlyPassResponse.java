package com.bgmagitapi.origin.controller.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

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
    // 'Y' = 이번 달이 패스 기간 안. 화면 배지용
    private String monthlyPassStatus;
    // 이번 달 이후에 끝나는(아직 쓸 수 있는) 기간들. 시작월 오름차순
    private List<Period> passes = new ArrayList<>();

    public BgmAgitMonthlyPassResponse(Long memberId, String memberName, String memberNickname,
                                      String memberPhoneNo, String memberLoginType) {
        this.memberId = memberId;
        this.memberName = memberName;
        this.memberNickname = memberNickname;
        this.memberPhoneNo = memberPhoneNo;
        this.memberLoginType = memberLoginType;
        this.monthlyPassStatus = "N";
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Period {
        private Long passId;
        private String startMonth; // "2026-11"
        private String endMonth;   // "2027-10"
    }
}
