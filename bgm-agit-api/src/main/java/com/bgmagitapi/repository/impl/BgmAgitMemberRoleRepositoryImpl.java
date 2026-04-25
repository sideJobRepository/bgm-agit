package com.bgmagitapi.repository.impl;

import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.repository.custom.BgmAgitMemberRoleCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.entity.QBgmAgitMemberRole.bgmAgitMemberRole;
import static com.bgmagitapi.entity.QBgmAgitRole.bgmAgitRole;

@RequiredArgsConstructor
public class BgmAgitMemberRoleRepositoryImpl implements BgmAgitMemberRoleCustomRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<BgmAgitRoleResponse> getRoles(Pageable pageable, String res) {
        // 1. 데이터 목록 조회
        List<BgmAgitRoleResponse> content = queryFactory
                .select(Projections.constructor(
                        BgmAgitRoleResponse.class,
                        bgmAgitMemberRole.bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMemberRole.bgmAgitRole.bgmAgitRoleId,
                        bgmAgitMember.bgmAgitMemberName,
                        bgmAgitMember.bgmAgitMemberNickname,
                        bgmAgitRole.bgmAgitRoleName,
                        bgmAgitMember.bgmAgitMemberEmail,
                        bgmAgitMember.bgmAgitMemberPhoneNo,
                        bgmAgitMember.socialType.stringValue()
                ))
                .from(bgmAgitMemberRole)
                .join(bgmAgitMemberRole.bgmAgitMember, bgmAgitMember)
                .join(bgmAgitMemberRole.bgmAgitRole, bgmAgitRole)
                .where(emailOrNameOrPhoneNo(res))
                .orderBy(
                       bgmAgitRole.bgmAgitRoleName.asc(),
                        bgmAgitMember.registDate.asc()
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        content.forEach(item -> item.setMemberPhoneNo(formatPhoneNo(item.getMemberPhoneNo())));
        // 2. 전체 개수 조회
        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitMember.count())
                .from(bgmAgitMember)
                .where(emailOrNameOrPhoneNo(res));
        
        return PageableExecutionUtils.getPage(content, pageable,countQuery::fetchOne);
    }
    
    @Override
    public Page<BgmAgitRoleResponse> getMahjongRoles(Pageable pageable, String res) {
        BooleanExpression mahjongOnly = bgmAgitMember.socialType.eq(BgmAgitSocialType.MAHJONG);

        List<BgmAgitRoleResponse> content = queryFactory
                .select(Projections.constructor(
                        BgmAgitRoleResponse.class,
                        bgmAgitMemberRole.bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMemberRole.bgmAgitRole.bgmAgitRoleId,
                        bgmAgitMember.bgmAgitMemberName,
                        bgmAgitMember.bgmAgitMemberNickname,
                        bgmAgitRole.bgmAgitRoleName,
                        bgmAgitMember.bgmAgitMemberEmail,
                        bgmAgitMember.bgmAgitMemberPhoneNo,
                        bgmAgitMember.socialType.stringValue()
                ))
                .from(bgmAgitMemberRole)
                .join(bgmAgitMemberRole.bgmAgitMember, bgmAgitMember)
                .join(bgmAgitMemberRole.bgmAgitRole, bgmAgitRole)
                .where(mahjongOnly, nicknameOrNameOrPhoneNo(res))
                .orderBy(
                        bgmAgitRole.bgmAgitRoleName.asc(),
                        bgmAgitMember.registDate.asc()
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        content.forEach(item -> item.setMemberPhoneNo(formatPhoneNo(item.getMemberPhoneNo())));

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitMember.count())
                .from(bgmAgitMember)
                .where(mahjongOnly, nicknameOrNameOrPhoneNo(res));

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    private String formatPhoneNo(String raw) {
        if (raw == null) return null;
        String digits = raw.replace("+82", "0").replaceAll("\\D", "");
        if (digits.length() == 11) {
            return digits.substring(0, 3) + "-" + digits.substring(3, 7) + "-" + digits.substring(7);
        }
        if (digits.length() == 10) {
            return digits.substring(0, 3) + "-" + digits.substring(3, 6) + "-" + digits.substring(6);
        }
        return digits;
    }

    private BooleanExpression nicknameOrNameOrPhoneNo(String res) {
        if (!StringUtils.hasText(res)) return null;

        String keyword = res;
        if (res.startsWith("010")) {
            keyword = res.replace("010", "+82 10");
        }
        return bgmAgitMember.bgmAgitMemberNickname.like("%" + keyword + "%")
                .or(bgmAgitMember.bgmAgitMemberName.like("%" + keyword + "%"))
                .or(bgmAgitMember.bgmAgitMemberPhoneNo.like("%" + keyword + "%"));
    }

    @Override
    public Optional<BgmAgitMemberRole> findByBgmAgitMemberId(Long memberId) {
        BgmAgitMemberRole result = queryFactory
                .selectFrom(bgmAgitMemberRole)
                .join(bgmAgitMemberRole.bgmAgitMember, bgmAgitMember)
                .where(bgmAgitMember.bgmAgitMemberId.eq(memberId))
                .fetchOne();
        
        return Optional.ofNullable(result);
    }
    
    private BooleanExpression emailOrNameOrPhoneNo(String res) {
        if (StringUtils.hasText(res) && res.startsWith("010")) {
            String replace = res.replace("010", "+82 10");
            return bgmAgitMember.bgmAgitMemberEmail.like("%" + replace + "%")
                    .or(bgmAgitMember.bgmAgitMemberName.like("%" + replace + "%"))
                    .or(bgmAgitMember.bgmAgitMemberPhoneNo.like("%" + replace + "%"));
        }
        if(StringUtils.hasText(res)) {
              return bgmAgitMember.bgmAgitMemberEmail.like("%" + res + "%")
                    .or(bgmAgitMember.bgmAgitMemberName.like("%" + res + "%"))
                    .or(bgmAgitMember.bgmAgitMemberPhoneNo.like("%" + res + "%"));
        }
        return null;
    }
}
