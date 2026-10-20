package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.controller.response.BgmAgitMonthlyPassResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.origin.controller.response.QBgmAgitMyPageGetResponse;
import com.bgmagitapi.origin.repository.custom.BgmAgitMemberCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;

@RequiredArgsConstructor
public class BgmAgitMemberRepositoryImpl implements BgmAgitMemberCustomRepository {

    private final JPAQueryFactory  queryFactory;

    @Override
    public BgmAgitMyPageGetResponse findByMyPage(Long id) {
        return queryFactory
                .select(
                        new QBgmAgitMyPageGetResponse(
                                bgmAgitMember.bgmAgitMemberId,
                                bgmAgitMember.bgmAgitMemberEmail,
                                bgmAgitMember.bgmAgitMemberName,
                                bgmAgitMember.bgmAgitMemberNickname,
                                bgmAgitMember.bgmAgitMemberPhoneNo,
                                bgmAgitMember.bgmAgitMemberNicknameUseStatus,
                                bgmAgitMember.bgmAgitMemberAlimtalkStatus,
                                bgmAgitMember.bgmAgitMemberMahjongUseStatus,
                                bgmAgitMember.bgmAgitMemberMonthlyPassStatus,
                                bgmAgitMember.registDate
                        )
                )
                .from(bgmAgitMember)
                .where(bgmAgitMember.bgmAgitMemberId.eq(id))
                .fetchFirst();
    }

    @Override
    public Page<BgmAgitMonthlyPassResponse> findMonthlyPassMembers(Pageable pageable, String keyword, boolean onlyPass) {
        List<BgmAgitMonthlyPassResponse> content = queryFactory
                .select(Projections.constructor(
                        BgmAgitMonthlyPassResponse.class,
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberName,
                        bgmAgitMember.bgmAgitMemberNickname,
                        bgmAgitMember.bgmAgitMemberPhoneNo,
                        bgmAgitMember.socialType.stringValue(),
                        bgmAgitMember.bgmAgitMemberMonthlyPassStatus
                ))
                .from(bgmAgitMember)
                .where(passOnly(onlyPass), nameOrNicknameOrPhoneNo(keyword))
                // 패스 회원을 위로 — 이번 달 누가 켜져 있는지 바로 보이게
                .orderBy(
                        bgmAgitMember.bgmAgitMemberMonthlyPassStatus.desc(),
                        bgmAgitMember.bgmAgitMemberName.asc(),
                        bgmAgitMember.bgmAgitMemberId.asc()
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitMember.count())
                .from(bgmAgitMember)
                .where(passOnly(onlyPass), nameOrNicknameOrPhoneNo(keyword));

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public long resetMonthlyPass() {
        return queryFactory
                .update(bgmAgitMember)
                .set(bgmAgitMember.bgmAgitMemberMonthlyPassStatus, "N")
                .where(bgmAgitMember.bgmAgitMemberMonthlyPassStatus.eq("Y"))
                .execute();
    }

    private BooleanExpression passOnly(boolean onlyPass) {
        return onlyPass ? bgmAgitMember.bgmAgitMemberMonthlyPassStatus.eq("Y") : null;
    }

    /**
     * 이름·닉네임·전화번호 검색. 전화번호는 하이픈 유무와 무관하게 찾도록 숫자만 비교하고,
     * 소셜 회원이 들고 있는 "+82 10…" 형식도 같이 본다.
     */
    private BooleanExpression nameOrNicknameOrPhoneNo(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        String trimmed = keyword.trim();
        BooleanExpression byText = bgmAgitMember.bgmAgitMemberName.like("%" + trimmed + "%")
                .or(bgmAgitMember.bgmAgitMemberNickname.like("%" + trimmed + "%"));

        String digits = trimmed.replaceAll("\\D", "");
        if (digits.length() < 3) {
            return byText;
        }
        // "+82 10-1234-5678" → "01012345678" 로 맞춰 비교한다
        var phoneDigits = Expressions.stringTemplate(
                "REPLACE(REPLACE(REPLACE({0}, '+82', '0'), '-', ''), ' ', '')",
                bgmAgitMember.bgmAgitMemberPhoneNo);
        return byText.or(phoneDigits.like("%" + digits + "%"));
    }
}
