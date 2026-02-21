package com.bgmagitapi.kml.setting.dto.request;

import jakarta.validation.constraints.NotBlank;
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
    
    
    @NotBlank(message = "반환점은 필수 입력입니다.")
    private Integer turning;
    @NotBlank(message = "1등 우마 점수는 필수 입력입니다.")
    private Integer firstUma;
    @NotBlank(message = "2등 우마 점수는 필수 입력입니다.")
    private Integer secondUma;
    @NotBlank(message = "3등 우마 점수는 필수 입력입니다.")
    private Integer thirdUma;
    @NotBlank(message = "4등 우마 점수는 필수 입력입니다.")
    private Integer fourthUma;
}
