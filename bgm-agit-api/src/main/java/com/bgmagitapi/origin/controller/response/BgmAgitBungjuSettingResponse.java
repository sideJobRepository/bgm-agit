package com.bgmagitapi.origin.controller.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class BgmAgitBungjuSettingResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer unitPrice;
    private boolean use;
}
