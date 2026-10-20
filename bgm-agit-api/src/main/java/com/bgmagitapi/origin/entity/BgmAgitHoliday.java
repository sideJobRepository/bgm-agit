package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.enumeration.HolidayType;
import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 관리자가 손으로 지정하는 공휴일 예외.
 *
 * 법정공휴일은 {@link com.bgmagitapi.origin.util.LunarCalendar} 가 이미 계산한다(설·추석·대체공휴일 포함).
 * 문제는 선거일·임시공휴일처럼 그때그때 고시되는 날이라, 계산으로는 알 수 없다.
 * 그래서 전체를 수동으로 들고 있지 않고 <b>예외만</b> 저장한다 —
 * ADD 는 "이 날도 공휴일로 쳐라", EXCLUDE 는 "계산은 공휴일이라지만 정상 영업한다".
 */
@Entity
@Table(name = "BGM_AGIT_HOLIDAY")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitHoliday extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_HOLIDAY_ID")
    private Long bgmAgitHolidayId;

    // 대상 날짜 (UNIQUE). 하루에 ADD 와 EXCLUDE 가 동시에 있을 수 없다
    @Column(name = "BGM_AGIT_HOLIDAY_DATE")
    private LocalDate bgmAgitHolidayDate;

    // 화면에 보여줄 이름 (예: "제22대 대선", "임시공휴일")
    @Column(name = "BGM_AGIT_HOLIDAY_NAME")
    private String bgmAgitHolidayName;

    @Column(name = "BGM_AGIT_HOLIDAY_TYPE")
    @Enumerated(EnumType.STRING)
    private HolidayType bgmAgitHolidayType;

    public BgmAgitHoliday(LocalDate date, String name, HolidayType type) {
        this.bgmAgitHolidayDate = date;
        this.bgmAgitHolidayName = name;
        this.bgmAgitHolidayType = type;
    }

    public void modify(String name, HolidayType type) {
        this.bgmAgitHolidayName = name;
        this.bgmAgitHolidayType = type;
    }
}
