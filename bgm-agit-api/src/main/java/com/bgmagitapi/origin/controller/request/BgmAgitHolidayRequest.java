package com.bgmagitapi.origin.controller.request;

import com.bgmagitapi.origin.entity.enumeration.HolidayType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitHolidayRequest {

    @NotNull(message = "날짜는 필수입니다.")
    private LocalDate date;

    // 화면 표시용 이름. 비우면 타입에 맞는 기본 문구가 들어간다
    private String name;

    /** ADD = 이 날도 공휴일로 / EXCLUDE = 계산상 공휴일이지만 정상 영업. 비우면 ADD */
    private HolidayType type;
}
