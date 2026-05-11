package com.bgmagitapi.kml.tournament.dto.response;

import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TournamentSettingOptionResponse {

    private Long tournamentSettingId;

    private Integer turning;

    private BigDecimal firstUma;

    private BigDecimal secondUma;

    private BigDecimal thirdUma;

    private BigDecimal fourthUma;

    private String useStatus;

    private String label;

    public static TournamentSettingOptionResponse from(TournamentSetting setting) {
        String label = String.format(
                "반환 %s / 우마 %s, %s, %s, %s%s",
                setting.getTurning(),
                setting.getFirstUma(),
                setting.getSecondUma(),
                setting.getThirdUma(),
                setting.getFourUma(),
                "Y".equals(setting.getUseStatus()) ? " (사용중)" : ""
        );

        return TournamentSettingOptionResponse.builder()
                .tournamentSettingId(setting.getId())
                .turning(setting.getTurning())
                .firstUma(setting.getFirstUma())
                .secondUma(setting.getSecondUma())
                .thirdUma(setting.getThirdUma())
                .fourthUma(setting.getFourUma())
                .useStatus(setting.getUseStatus())
                .label(label)
                .build();
    }
}
