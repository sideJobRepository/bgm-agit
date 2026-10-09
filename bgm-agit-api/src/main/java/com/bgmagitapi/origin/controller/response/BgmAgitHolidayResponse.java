package com.bgmagitapi.origin.controller.response;

import com.bgmagitapi.origin.entity.enumeration.HolidayType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

/**
 * 공휴일 한 건.
 *
 * 법정공휴일(계산)과 수동 예외를 한 목록으로 합쳐 내려준다. 관리자 화면에서 둘을 구분해야
 * "이건 자동이라 지울 수 없다"를 보여줄 수 있으므로 {@code holidayId} 유무로 가른다.
 */
@Getter
@AllArgsConstructor
public class BgmAgitHolidayResponse {

    /** 수동 예외면 그 행의 id, 법정공휴일 자동 계산이면 null */
    private Long holidayId;
    private LocalDate date;
    private String name;
    /** 수동 예외의 종류. 자동 계산분은 null */
    private HolidayType type;
    /** 최종 판정 — 이 날 주말 단가를 받는지 */
    private boolean holiday;
}
