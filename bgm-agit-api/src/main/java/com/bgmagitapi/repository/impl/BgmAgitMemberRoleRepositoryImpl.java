package com.bgmagitapi.repository.impl;

import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.repository.costom.BgmAgitMemberRoleCustomRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
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
    public Page<BgmAgitRoleResponse> getRoles(Pageable pageable, String email) {
        // 1. 데이터 목록 조회
        List<BgmAgitRoleResponse> content = queryFactory
                .select(Projections.constructor(
                        BgmAgitRoleResponse.class,
                        bgmAgitMemberRole.bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMemberRole.bgmAgitRole.bgmAgitRoleId,
                        bgmAgitMember.bgmAgitMemberName,
                        bgmAgitRole.bgmAgitRoleName,
                        bgmAgitMember.bgmAgitMemberEmail
                ))
                .from(bgmAgitMemberRole)
                .join(bgmAgitMemberRole.bgmAgitMember, bgmAgitMember)
                .join(bgmAgitMemberRole.bgmAgitRole, bgmAgitRole)
                .where(emailLike(email))
                .orderBy(
                        // ADMIN이면 0, 그 외는 1 → 오름차순 정렬
                        new CaseBuilder()
                                .when(bgmAgitRole.bgmAgitRoleName.eq("ADMIN")).then(0)
                                .otherwise(1).asc()
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        // 2. 전체 개수 조회
        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitMember.count())
                .from(bgmAgitMember)
                .where(emailLike(email));
        
        return PageableExecutionUtils.getPage(content, pageable,countQuery::fetchOne);
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
    
    private BooleanExpression emailLike(String email) {
        return StringUtils.hasText(email) ? bgmAgitMember.bgmAgitMemberEmail.like("%" + email + "%") : null;
    }
}
