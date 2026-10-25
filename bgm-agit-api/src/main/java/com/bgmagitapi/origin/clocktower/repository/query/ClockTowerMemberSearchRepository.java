package com.bgmagitapi.origin.clocktower.repository.query;

import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerMemberOption;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitSocialType;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;

/**
 * 시계탑 진행판 참가자 검색. 참가자는 전원 회원(자체로그인)이고, 메인 사이트로 가입한 보드게임 회원도 찾아야 해서
 * 공용 /all-members(마작 이용 회원 'Y' 만)를 쓰지 않는다. BML 기록 입력처럼 닉네임으로만 찾는다.
 */
@Repository
@RequiredArgsConstructor
public class ClockTowerMemberSearchRepository {

    private static final int LIMIT = 30;

    private final JPAQueryFactory queryFactory;

    public List<ClockTowerMemberOption> searchByNickname(String keyword) {
        return queryFactory
                .select(Projections.constructor(ClockTowerMemberOption.class,
                        bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname))
                .from(bgmAgitMember)
                .where(bgmAgitMember.socialType.eq(BgmAgitSocialType.MAHJONG),
                        bgmAgitMember.bgmAgitMemberNickname.containsIgnoreCase(keyword))
                .orderBy(bgmAgitMember.bgmAgitMemberNickname.asc())
                .limit(LIMIT)
                .fetch();
    }
}
