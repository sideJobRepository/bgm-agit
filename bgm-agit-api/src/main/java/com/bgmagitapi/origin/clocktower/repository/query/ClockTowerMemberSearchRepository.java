package com.bgmagitapi.origin.clocktower.repository.query;

import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerMemberOption;
import com.bgmagitapi.origin.clocktower.util.ClockTowerMemberMatcher;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitSocialType;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.bgmagitapi.origin.clocktower.entity.QBgmAgitClockTowerParticipant.bgmAgitClockTowerParticipant;
import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;

/**
 * 시계탑 진행판 참가자 검색. 참가자는 전원 회원(자체로그인)이고, 메인 사이트로 가입한 보드게임 회원도 찾아야 해서
 * 공용 /all-members(마작 이용 회원 'Y' 만)를 쓰지 않는다. BML 기록 입력처럼 닉네임으로만 찾는다.
 *
 * 초성 검색("ㅎㄱㄷ")은 SQL LIKE 로 못 하므로 자체로그인 회원 닉네임을 전부 받아 자바에서 고른다(운영 회원 300명 남짓).
 * 순서는 같은 닉네임 → 앞에서부터 걸림 → 중간에 걸림, 같은 순위면 시계탑 기록이 많은 사람(단골)부터.
 */
@Repository
@RequiredArgsConstructor
public class ClockTowerMemberSearchRepository {

    private static final int LIMIT = 30;

    private final JPAQueryFactory queryFactory;

    public List<ClockTowerMemberOption> searchByNickname(String keyword) {
        List<Tuple> members = queryFactory
                .select(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .from(bgmAgitMember)
                .where(bgmAgitMember.socialType.eq(BgmAgitSocialType.MAHJONG))
                .fetch();

        List<Candidate> matched = members.stream()
                .map(t -> new Candidate(t.get(bgmAgitMember.bgmAgitMemberId), t.get(bgmAgitMember.bgmAgitMemberNickname),
                        ClockTowerMemberMatcher.rank(t.get(bgmAgitMember.bgmAgitMemberNickname), keyword)))
                .filter(c -> c.rank() != ClockTowerMemberMatcher.NO_MATCH)
                .toList();
        if (matched.isEmpty()) return List.of();

        Map<Long, Long> playCounts = playCounts(matched.stream().map(Candidate::id).toList());
        return matched.stream()
                .sorted(Comparator.comparingInt(Candidate::rank)
                        .thenComparing(c -> playCounts.getOrDefault(c.id(), 0L), Comparator.reverseOrder())
                        .thenComparing(Candidate::nickname, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(LIMIT)
                .map(c -> new ClockTowerMemberOption(c.id(), c.nickname()))
                .toList();
    }

    // 회원별 시계탑 기록 참가 수. 인스턴스 집계 메서드는 이 프로젝트에서 컴파일이 안 돼 템플릿으로 쓴다
    private Map<Long, Long> playCounts(List<Long> memberIds) {
        NumberExpression<Long> count = Expressions.numberTemplate(Long.class, "COUNT({0})", bgmAgitClockTowerParticipant.id);
        return queryFactory
                .select(bgmAgitClockTowerParticipant.bgmAgitMember.bgmAgitMemberId, count)
                .from(bgmAgitClockTowerParticipant)
                .where(bgmAgitClockTowerParticipant.bgmAgitMember.bgmAgitMemberId.in(memberIds))
                .groupBy(bgmAgitClockTowerParticipant.bgmAgitMember.bgmAgitMemberId)
                .fetch()
                .stream()
                .collect(Collectors.toMap(
                        t -> t.get(bgmAgitClockTowerParticipant.bgmAgitMember.bgmAgitMemberId),
                        t -> {
                            Long n = t.get(count);
                            return n == null ? 0L : n;
                        }));
    }

    private record Candidate(Long id, String nickname, int rank) {
    }
}
