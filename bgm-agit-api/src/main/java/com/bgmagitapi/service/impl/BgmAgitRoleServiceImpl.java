package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.repository.BgmAgitRoleRepository;
import com.bgmagitapi.security.manager.BgmAgitAuthorizationManager;
import com.bgmagitapi.service.BgmAgitRoleService;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.entity.QBgmAgitMemberRole.bgmAgitMemberRole;
import static com.bgmagitapi.entity.QBgmAgitRole.bgmAgitRole;


@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitRoleServiceImpl implements BgmAgitRoleService {
    
    private final BgmAgitRoleRepository bgmAgitRoleRepository;
    
    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    
    private final BgmAgitAuthorizationManager bgmAgitAuthorizationManager;
    
    @Override
    @Transactional(readOnly = true)
    public Page<BgmAgitRoleResponse> getRoles(Pageable pageable, String email) {
        return bgmAgitMemberRoleRepository.getRoles(pageable,email);
    }
  
    
    @Override
    public ApiResponse modifyRole(List<BgmAgitRoleModifyRequest> requestList) {
        for (BgmAgitRoleModifyRequest request : requestList) {
            Long memberId = request.getMemberId();
            Long newRoleId = request.getRoleId();
            
            // 1. 기존 memberId로 role 데이터 찾기
            BgmAgitMemberRole memberRole = bgmAgitMemberRoleRepository
                    .findByBgmAgitMemberId(memberId)
                    .orElseThrow(() -> new RuntimeException("해당 회원의 권한 정보가 없습니다."));
            
            // 2. 새로운 Role 엔티티 조회
            BgmAgitRole newRole = bgmAgitRoleRepository.findById(newRoleId)
                    .orElseThrow(() -> new RuntimeException("해당 ROLE_ID가 존재하지 않습니다."));
            
            // 3. Role 정보 변경
            memberRole.modifyRole(newRole);
        }
        bgmAgitAuthorizationManager.reload();
        // 4. 저장
        return new ApiResponse(200,true,"권한이 성공적으로 변경되었습니다.");
    }
}
