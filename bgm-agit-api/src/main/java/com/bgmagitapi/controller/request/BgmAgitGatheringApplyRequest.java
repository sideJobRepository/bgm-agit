package com.bgmagitapi.controller.request;

import lombok.Getter;

@Getter
public class BgmAgitGatheringApplyRequest {

    // 다른 장르도 가능 (시계탑↔머미 유연 참가)
    private Boolean flexible;
}
