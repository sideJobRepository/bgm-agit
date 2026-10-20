package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.controller.response.BgmAgitMonthlyPassResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.origin.controller.response.QBgmAgitMyPageGetResponse;
import com.bgmagitapi.origin.repository.custom.BgmAgitMemberCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.time.YearMonth;
import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.origin.entity.QBgmAgitMonthlyPass.bgmAgitMonthlyPass;

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
                                bgmAgitMember.registDate
                        )
                )
                .from(bgmAgitMember)
                .where(bgmAgitMember.bgmAgitMemberId.eq(id))
                .fetchFirst();
    }

    @Override
    public Page<BgmAgitMonthlyPassResponse> findMonthlyPassMembers(Pageable pageable, String keyword, boolean onlyPass, YearMonth thisMonth) {
        List<BgmAgitMonthlyPassResponse> content = queryFactory
                .select(Projections.constructor(
                        BgmAgitMonthlyPassResponse.class,
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberName,
                        bgmAgitMember.bgmAgitMemberNickname,
                        bgmAgitMember.bgmAgitMemberPhoneNo,
                        bgmAgitMember.socialType.stringValue()
                ))
                .from(bgmAgitMember)
                .where(passOnly(onlyPass, thisMonth), nameOrNicknameOrPhoneNo(keyword))
                .orderBy(
                        bgmAgitMember.bgmAgitMemberName.asc(),
                        bgmAgitMember.bgmAgitMemberId.asc()
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitMember.count())
                .from(bgmAgitMember)
                .where(passOnly(onlyPass, thisMonth), nameOrNicknameOrPhoneNo(keyword));

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    /** 이번 달 이후에 끝나는(=지금 쓰거나 앞으로 쓸) 패스 기간이 있는 회원만 */
    private BooleanExpression passOnly(boolean onlyPass, YearMonth thisMonth) {
        if (!onlyPass) {
            return null;
        }
        return JPAExpressions.selectOne()
                .from(bgmAgitMonthlyPass)
                .where(bgmAgitMonthlyPass.bgmAgitMember.bgmAgitMemberId.eq(bgmAgitMember.bgmAgitMemberId),
                        bgmAgitMonthlyPass.bgmAgitMonthlyPassEndMonth.goe(thisMonth.atDay(1)))
                .exists();
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
