package com.bgmagitapi.kml.setting.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.print.attribute.standard.MediaSize;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SettingPostRequest {


    @NotNull(message = "반환점은 필수 입력입니다.")
    private Integer turning;
    @NotNull(message = "1등 우마 점수는 필수 입력입니다.")
    private Integer firstUma;
    @NotNull(message = "2등 우마 점수는 필수 입력입니다.")
    private Integer secondUma;
    @NotNull(message = "3등 우마 점수는 필수 입력입니다.")
    private Integer thirdUma;
    @NotNull(message = "4등 우마 점수는 필수 입력입니다.")
    private Integer fourthUma;
}
