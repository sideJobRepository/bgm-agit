package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitBungjuSettingRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitBungjuBenefitResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitBungjuSettingResponse;
import com.bgmagitapi.origin.entity.BgmAgitBungjuSetting;
import com.bgmagitapi.origin.entity.BgmAgitRoom;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

/** 벙주 혜택 — 권한 판정, 혜택가 판정, 관리자 설정·적용 내역 */
public interface BgmAgitBungjuService {

    /** 벙주 권한 회원인지(DB 의 현재 권한) */
    boolean isBungju(Long memberId);

    /** 지금 설정. 행이 없으면 null(혜택 꺼짐으로 취급) */
    BgmAgitBungjuSetting currentSetting();

    /**
     * 이 예약에 줄 벙주 혜택 1인 단가. 대상이 아니면 null.
     * 벙주 + 설정이 켜져 있고 기간 안 + 평일 + 룸(인원 × 단가)일 때만.
     */
    Integer bungjuPriceFor(BgmAgitBungjuSetting setting, boolean bungju, Collection<BgmAgitRoom> rooms,
                           LocalDate useDate, boolean weekendRate);

    BgmAgitBungjuSettingResponse getSetting(List<String> roles);

    ApiResponse updateSetting(BgmAgitBungjuSettingRequest request, List<String> roles);

    List<BgmAgitBungjuBenefitResponse> getBenefitReservations(LocalDate from, LocalDate to, List<String> roles);
}
