package com.bgmagitapi.origin.entity;

import com.bgmagitapi.origin.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.YearMonth;

/**
 * 월간패스 기간. 회원 1명이 여러 기간을 가질 수 있다(연장·중간에 끊긴 달).
 *
 * 처음엔 회원 컬럼 Y/N 하나로 "이번 달 패스"만 들고 매월 1일 초기화했는데, 다음 달 패스를 미리 사거나
 * 1년치를 한 번에 결제하는 손님을 표현할 수 없었다. 그래서 시작월~끝월(둘 다 포함) 기간으로 바꿨다.
 * 기간이 지나면 저절로 무효라 초기화 배치가 필요 없다.
 *
 * 월 단위라 날짜 컬럼에는 그 달 1일만 넣는다.
 */
@Entity
@Table(name = "BGM_AGIT_MONTHLY_PASS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitMonthlyPass extends DateSuperClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MONTHLY_PASS_ID")
    private Long bgmAgitMonthlyPassId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;

    // 시작월 1일 (포함)
    @Column(name = "BGM_AGIT_MONTHLY_PASS_START_MONTH")
    private LocalDate bgmAgitMonthlyPassStartMonth;

    // 끝월 1일 (포함)
    @Column(name = "BGM_AGIT_MONTHLY_PASS_END_MONTH")
    private LocalDate bgmAgitMonthlyPassEndMonth;

    public BgmAgitMonthlyPass(BgmAgitMember member, YearMonth start, int months) {
        this.bgmAgitMember = member;
        this.bgmAgitMonthlyPassStartMonth = start.atDay(1);
        this.bgmAgitMonthlyPassEndMonth = start.plusMonths(months - 1L).atDay(1);
    }

    public YearMonth getStartYearMonth() {
        return YearMonth.from(bgmAgitMonthlyPassStartMonth);
    }

    public YearMonth getEndYearMonth() {
        return YearMonth.from(bgmAgitMonthlyPassEndMonth);
    }
}
