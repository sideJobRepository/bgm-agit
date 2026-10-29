package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 벙주 혜택 설정 — 한 행(ID 1)만 쓴다.
 *
 * 혜택 기간·1인 요금·사용 여부를 관리자가 개발자 없이 바꿀 수 있어야 해서(사장님 요구사항 2026-10-29) 코드 상수 대신 DB 에 둔다.
 * 예약이 들어올 때 이 값으로 판정해 예약 행에 단가를 박아 두므로(BgmAgitReservation.bungjuPrice) 설정을 바꿔도 이미 받은 예약 금액은 그대로다.
 */
@Entity
@Table(name = "BGM_AGIT_BUNGJU_SETTING")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitBungjuSetting extends DateSuperClass {

    public static final Long SINGLE_ID = 1L;

    @Id
    @Column(name = "BGM_AGIT_BUNGJU_SETTING_ID")
    private Long bgmAgitBungjuSettingId;

    // 혜택 기간(이용일 기준, 양끝 포함)
    @Column(name = "BGM_AGIT_BUNGJU_START_DATE")
    private LocalDate startDate;

    @Column(name = "BGM_AGIT_BUNGJU_END_DATE")
    private LocalDate endDate;

    // 1인 요금(하루 무제한)
    @Column(name = "BGM_AGIT_BUNGJU_UNIT_PRICE")
    private Integer unitPrice;

    // 'Y' 사용 / 'N' 끔
    @Column(name = "BGM_AGIT_BUNGJU_USE_STATUS")
    private String useStatus;

    public void modify(LocalDate startDate, LocalDate endDate, Integer unitPrice, boolean use) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.unitPrice = unitPrice;
        this.useStatus = use ? "Y" : "N";
    }

    public boolean isUse() {
        return "Y".equalsIgnoreCase(this.useStatus);
    }

    /** 혜택이 켜져 있고 이용일이 기간 안인지. 평일 여부·룸 여부는 호출부가 따로 본다. */
    public boolean covers(LocalDate useDate) {
        return isUse() && useDate != null && startDate != null && endDate != null
                && !useDate.isBefore(startDate) && !useDate.isAfter(endDate);
    }
}
