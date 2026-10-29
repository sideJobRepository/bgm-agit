package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class BgmAgitBungjuSettingRequest {

    @NotNull(message = "혜택 시작일을 입력해 주세요.")
    private LocalDate startDate;

    @NotNull(message = "혜택 종료일을 입력해 주세요.")
    private LocalDate endDate;

    @NotNull(message = "1인 요금을 입력해 주세요.")
    @Min(value = 1000, message = "1인 요금은 1,000원 이상이어야 합니다.")
    @Max(value = 100000, message = "1인 요금이 너무 큽니다.")
    private Integer unitPrice;

    private boolean use;
}
