package com.bgmagitapi.kml.tournamentsetting.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TournamentSettingPostRequest {

    @NotNull(message = "반환점은 필수 입력입니다.")
    private Integer turning;

    @NotNull(message = "1등 우마는 필수 입력입니다.")
    private BigDecimal firstUma;

    @NotNull(message = "2등 우마는 필수 입력입니다.")
    private BigDecimal secondUma;

    @NotNull(message = "3등 우마는 필수 입력입니다.")
    private BigDecimal thirdUma;

    @NotNull(message = "4등 우마는 필수 입력입니다.")
    private BigDecimal fourthUma;
}
