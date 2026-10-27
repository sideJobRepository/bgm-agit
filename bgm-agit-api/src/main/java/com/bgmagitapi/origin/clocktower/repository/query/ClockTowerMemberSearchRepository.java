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
 * 시계탑 진행판 참가자 검색. 참가자는 전원 회원이고 메인 사이트 가입자도 찾아야 해서
 * 공용 /all-members(마작 이용 회원 'Y' 만)를 쓰지 않는다. 닉네임으로만 찾는다.
 * 카카오·네이버 회원도 찾는다(2026-10-27 사용자 결정 — 예전엔 자체로그인만이라 소셜 가입 손님은 다시 가입해야 넣을 수 있었다).
 * 소셜과 자체로그인은 닉네임이 겹칠 수 있어(운영 4쌍) 소셜이면 loginType 을 붙여 화면이 구분하게 한다.
 *
 * 초성 검색("ㅎㄱㄷ")은 SQL LIKE 로 못 하므로 회원 닉네임을 전부 받아 자바에서 고른다(운영 회원 300명 남짓).
 * 순서는 같은 닉네임 → 앞에서부터 걸림 → 중간에 걸림, 같은 순위면 시계탑 기록이 많은 사람(단골)부터.
 */
@Repository
@RequiredArgsConstructor
public class ClockTowerMemberSearchRepository {

    private static final int LIMIT = 30;

    private final JPAQueryFactory queryFactory;

    public List<ClockTowerMemberOption> searchByNickname(String keyword) {
        List<Tuple> members = queryFactory
                .select(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname, bgmAgitMember.socialType)
                .from(bgmAgitMember)
                .fetch();

        List<Candidate> matched = members.stream()
                .map(t -> new Candidate(t.get(bgmAgitMember.bgmAgitMemberId), t.get(bgmAgitMember.bgmAgitMemberNickname),
                        loginTypeLabel(t.get(bgmAgitMember.socialType)),
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
                .map(c -> new ClockTowerMemberOption(c.id(), c.nickname(), c.loginType()))
                .toList();
    }

    private static String loginTypeLabel(BgmAgitSocialType type) {
        if (type == null) return null;
        return switch (type) {
            case KAKAO -> "카카오";
            case NAVER -> "네이버";
            case GOOGLE -> "구글";
            case MAHJONG -> null;
        };
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

    private record Candidate(Long id, String nickname, String loginType, int rank) {
    }
}
