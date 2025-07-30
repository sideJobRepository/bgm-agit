package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.controller.request.BgmAgitRoleRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.entity.*;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.repository.BgmAgitRoleRepository;
import com.bgmagitapi.security.manager.BgmAgitAuthorizationManager;
import com.bgmagitapi.service.BgmAgitRoleService;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitRoleServiceImpl implements BgmAgitRoleService {
    
    private final BgmAgitRoleRepository bgmAgitRoleRepository;
    
    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitAuthorizationManager bgmAgitAuthorizationManager;
    
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<BgmAgitRoleResponse> getRoles(Pageable pageable, BgmAgitRoleRequest request) {
        QBgmAgitMemberRole memberRole = QBgmAgitMemberRole.bgmAgitMemberRole;
        QBgmAgitMember member = QBgmAgitMember.bgmAgitMember;
        QBgmAgitRole role = QBgmAgitRole.bgmAgitRole;
        
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        
        if (StringUtils.hasText(request.getMemberEmail())) {
            booleanBuilder.and(member.bgmAgitMemberEmail.like("%" + request.getMemberEmail() + "%"));
        }
        
        // 1. 데이터 목록 조회
        List<BgmAgitRoleResponse> content = queryFactory
                .select(Projections.constructor(
                        BgmAgitRoleResponse.class,
                        memberRole.bgmAgitMember.bgmAgitMemberId,
                        memberRole.bgmAgitRole.bgmAgitRoleId,
                        member.bgmAgitMemberName,
                        role.bgmAgitRoleName,
                        member.bgmAgitMemberEmail
                ))
                .from(memberRole)
                .join(memberRole.bgmAgitMember, member)
                .join(memberRole.bgmAgitRole, role)
                .where(booleanBuilder)
                .orderBy(
                        // ADMIN이면 0, 그 외는 1 → 오름차순 정렬
                        Expressions.numberTemplate(Integer.class,
                                "case when {0} = 'ADMIN' then 0 else 1 end", role.bgmAgitRoleName
                        ).asc()
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        // 2. 전체 개수 조회
        Long total = queryFactory
                .select(memberRole.count())
                .from(memberRole)
                .where(booleanBuilder)
                .fetchOne();
        if (total == null) total = 0L;
        
        return new PageImpl<>(content, pageable, total);
    }
    
    @Override
    public ApiResponse modifyRole(BgmAgitRoleModifyRequest request) {
        Long memberId = request.getMemberId();
        Long newRoleId = request.getRoleId();
        
        // 1. 기존 memberId로 role 데이터 찾기
        BgmAgitMemberRole memberRole = bgmAgitMemberRoleRepository.findByBgmAgitMember_BgmAgitMemberId(memberId)
                .orElseThrow(() -> new RuntimeException("해당 회원의 권한 정보가 없습니다."));
        
        // 2. 새로운 Role 엔티티 조회
        BgmAgitRole newRole = bgmAgitRoleRepository.findById(newRoleId)
                .orElseThrow(() -> new RuntimeException("해당 ROLE_ID가 존재하지 않습니다."));
        
        // 3. Role 정보 변경
        memberRole.modifyRole(newRole);
        
        
        bgmAgitAuthorizationManager.reload();
        // 4. 저장
        return new ApiResponse(200,true,"권한이 성공적으로 변경되었습니다.");
    }
}
