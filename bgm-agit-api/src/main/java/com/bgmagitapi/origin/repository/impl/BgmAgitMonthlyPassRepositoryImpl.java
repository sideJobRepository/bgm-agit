package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.entity.BgmAgitMonthlyPass;
import com.bgmagitapi.origin.repository.custom.BgmAgitMonthlyPassCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.bgmagitapi.origin.entity.QBgmAgitMonthlyPass.bgmAgitMonthlyPass;

@RequiredArgsConstructor
public class BgmAgitMonthlyPassRepositoryImpl implements BgmAgitMonthlyPassCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public boolean coversMonth(Long memberId, YearMonth month) {
        if (memberId == null || month == null) {
            return false;
        }
        LocalDate first = month.atDay(1);
        return queryFactory
                .selectOne()
                .from(bgmAgitMonthlyPass)
                .where(
                        bgmAgitMonthlyPass.bgmAgitMember.bgmAgitMemberId.eq(memberId),
                        bgmAgitMonthlyPass.bgmAgitMonthlyPassStartMonth.loe(first),
                        bgmAgitMonthlyPass.bgmAgitMonthlyPassEndMonth.goe(first)
                )
                .fetchFirst() != null;
    }

    @Override
    public Map<Long, List<BgmAgitMonthlyPass>> findActivePassesByMemberIds(List<Long> memberIds, YearMonth from) {
        Map<Long, List<BgmAgitMonthlyPass>> result = new LinkedHashMap<>();
        if (memberIds == null || memberIds.isEmpty()) {
            return result;
        }
        List<BgmAgitMonthlyPass> passes = queryFactory
                .selectFrom(bgmAgitMonthlyPass)
                .where(
                        bgmAgitMonthlyPass.bgmAgitMember.bgmAgitMemberId.in(memberIds),
                        bgmAgitMonthlyPass.bgmAgitMonthlyPassEndMonth.goe(from.atDay(1))
                )
                .orderBy(bgmAgitMonthlyPass.bgmAgitMonthlyPassStartMonth.asc())
                .fetch();
        for (BgmAgitMonthlyPass pass : passes) {
            result.computeIfAbsent(pass.getBgmAgitMember().getBgmAgitMemberId(), k -> new java.util.ArrayList<>()).add(pass);
        }
        return result;
    }
}
