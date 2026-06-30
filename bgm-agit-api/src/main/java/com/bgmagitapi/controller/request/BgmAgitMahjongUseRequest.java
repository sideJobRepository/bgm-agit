package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

// 관리자가 /role 자체로그인 탭에서 회원의 마작(BML) 연동을 켜고 끄는 요청
@Data
public class BgmAgitMahjongUseRequest {

    @NotNull(message = "멤버 ID를 넣어주세요")
    private Long memberId;

    // true = 연동(마작 이용 회원 전환 + KML 등록), false = 연동 해제
    private boolean use;
}
