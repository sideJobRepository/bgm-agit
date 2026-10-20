package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

// 관리자가 /role 월간패스 탭에서 회원의 월간패스 여부를 켜고 끄는 요청
@Data
public class BgmAgitMonthlyPassRequest {

    @NotNull(message = "멤버 ID를 넣어주세요")
    private Long memberId;

    // true = 이번 달 월간패스 회원, false = 해제
    private boolean pass;
}
