package com.bgmagitapi.kml.setting.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SettingGetResponse {
    
    private Integer turning;
    private Integer firstUma;
    private Integer secondUma;
    private Integer thirdUma;
    private Integer fourthUma;
}
