package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.entity.BgmAgitHoliday;
import com.bgmagitapi.origin.repository.custom.BgmAgitHolidayCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static com.bgmagitapi.origin.entity.QBgmAgitHoliday.bgmAgitHoliday;

@RequiredArgsConstructor
public class BgmAgitHolidayRepositoryImpl implements BgmAgitHolidayCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<BgmAgitHoliday> findHolidayByDate(LocalDate date) {
        return Optional.ofNullable(queryFactory
                .selectFrom(bgmAgitHoliday)
                .where(bgmAgitHoliday.bgmAgitHolidayDate.eq(date))
                .fetchFirst());
    }

    @Override
    public List<BgmAgitHoliday> findHolidaysBetween(LocalDate from, LocalDate to) {
        return queryFactory
                .selectFrom(bgmAgitHoliday)
                .where(bgmAgitHoliday.bgmAgitHolidayDate.between(from, to))
                .orderBy(bgmAgitHoliday.bgmAgitHolidayDate.asc())
                .fetch();
    }
}
