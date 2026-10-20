package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

// 관리자가 /role 월간패스 탭에서 회원의 패스 기간(시작월 + 개월 수)을 등록하는 요청
@Data
public class BgmAgitMonthlyPassRequest {

    @NotNull(message = "멤버 ID를 넣어주세요")
    private Long memberId;

    // 시작월 "YYYY-MM"
    @NotNull(message = "시작월을 선택해 주세요")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "시작월 형식이 올바르지 않습니다.")
    private String startMonth;

    // 개월 수 (1개월 ~ 12개월)
    @NotNull(message = "개월 수를 선택해 주세요")
    @Min(value = 1, message = "1개월 이상 선택해 주세요")
    @Max(value = 12, message = "최대 12개월까지 등록할 수 있습니다")
    private Integer months;
}
