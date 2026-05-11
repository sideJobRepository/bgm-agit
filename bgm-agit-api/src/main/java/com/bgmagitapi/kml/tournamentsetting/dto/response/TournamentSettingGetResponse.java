package com.bgmagitapi.kml.tournamentsetting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TournamentSettingGetResponse {

    private Integer turning;
    private BigDecimal firstUma;
    private BigDecimal secondUma;
    private BigDecimal thirdUma;
    private BigDecimal fourthUma;
}
