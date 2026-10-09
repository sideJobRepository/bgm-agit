package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.entity.BgmAgitHoliday;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BgmAgitHolidayCustomRepository {

    /** 그 날짜의 수동 지정(ADD/EXCLUDE). 날짜당 1행이다. */
    Optional<BgmAgitHoliday> findHolidayByDate(LocalDate date);

    /** 기간 내 수동 지정 목록(양 끝 포함, 날짜 오름차순). */
    List<BgmAgitHoliday> findHolidaysBetween(LocalDate from, LocalDate to);
}
