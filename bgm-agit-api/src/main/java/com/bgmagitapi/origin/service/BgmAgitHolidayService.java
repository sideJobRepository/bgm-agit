package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitHolidayRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitHolidayResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * 공휴일 판정과 수동 예외 관리.
 *
 * 요금에 쓰는 유일한 출처다. 주말 단가는 "토·일 <b>또는</b> 공휴일"에 붙는다.
 */
public interface BgmAgitHolidayService {

    /** 주말 단가를 적용할 날인지 — 토·일이거나 공휴일. 요금 계산은 전부 이 메서드를 거친다 */
    boolean isWeekendRate(LocalDate date);

    /** 공휴일인지(토·일은 제외). 법정공휴일 계산 결과에 수동 ADD/EXCLUDE 를 얹은 값 */
    boolean isHoliday(LocalDate date);

    /** 기간 안의 공휴일 목록. 관리자 화면과 예약 캘린더 표시에 쓴다 */
    List<BgmAgitHolidayResponse> getHolidays(LocalDate from, LocalDate to);

    /** 수동 예외 등록·수정(날짜 기준 upsert). 관리자 전용 */
    ApiResponse saveHoliday(BgmAgitHolidayRequest request, List<String> roles);

    /** 수동 예외 삭제. 지우면 그 날은 다시 법정공휴일 계산 결과를 따른다. 관리자 전용 */
    ApiResponse deleteHoliday(Long holidayId, List<String> roles);
}
