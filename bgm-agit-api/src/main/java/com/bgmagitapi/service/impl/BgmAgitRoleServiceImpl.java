package com.bgmagitapi.service.impl;

import com.bgmagitapi.advice.exception.ValidException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitMemberPasswordChangeRequest;
import com.bgmagitapi.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.repository.BgmAgitRoleRepository;
import com.bgmagitapi.security.manager.BgmAgitAuthorizationManager;
import com.bgmagitapi.service.BgmAgitRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitRoleServiceImpl implements BgmAgitRoleService {

    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_MENTOR = "ROLE_MENTOR";
    private static final String ROLE_NAME_USER = "USER";

    private final BgmAgitRoleRepository bgmAgitRoleRepository;

    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;

    private final BgmAgitMemberRepository bgmAgitMemberRepository;

    private final PasswordEncoder passwordEncoder;

    private final BgmAgitAuthorizationManager bgmAgitAuthorizationManager;

    @Override
    @Transactional(readOnly = true)
    public Page<BgmAgitRoleResponse> getRoles(Pageable pageable, String res) {
        return bgmAgitMemberRoleRepository.getRoles(pageable,res);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BgmAgitRoleResponse> getMahjongRoles(Pageable pageable, String res) {
        return bgmAgitMemberRoleRepository.getMahjongRoles(pageable, res);
    }



    @Override
    public ApiResponse modifyRole(List<BgmAgitRoleModifyRequest> requestList, List<String> actorRoles) {
        boolean actorIsAdmin = hasRole(actorRoles, ROLE_ADMIN);
        boolean actorIsMentor = !actorIsAdmin && hasRole(actorRoles, ROLE_MENTOR);

        if (!actorIsAdmin && !actorIsMentor) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // 사전 검증 + 변경 대상 수집 (멘토 검증 실패 시 부분 적용 방지)
        List<BgmAgitMemberRole> targets = new ArrayList<>(requestList.size());
        List<BgmAgitRole> newRoles = new ArrayList<>(requestList.size());

        for (BgmAgitRoleModifyRequest request : requestList) {
            BgmAgitMemberRole memberRole = bgmAgitMemberRoleRepository
                    .findByBgmAgitMemberId(request.getMemberId())
                    .orElseThrow(() -> new RuntimeException("해당 회원의 권한 정보가 없습니다."));

            BgmAgitRole newRole = bgmAgitRoleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("해당 ROLE_ID가 존재하지 않습니다."));

            if (actorIsMentor) {
                String currentName = memberRole.getBgmAgitRole().getBgmAgitRoleName();
                String newName = newRole.getBgmAgitRoleName();
                if (!ROLE_NAME_USER.equals(currentName) || !ROLE_NAME_USER.equals(newName)) {
                    throw new RuntimeException("멘토는 유저의 권한만 변경할 수 있습니다.");
                }
            }

            targets.add(memberRole);
            newRoles.add(newRole);
        }

        for (int i = 0; i < targets.size(); i++) {
            targets.get(i).modifyRole(newRoles.get(i));
        }

        bgmAgitAuthorizationManager.reload();
        return new ApiResponse(200,true,"권한이 성공적으로 변경되었습니다.");
    }

    @Override
    public ApiResponse changePassword(BgmAgitMemberPasswordChangeRequest request, List<String> actorRoles) {
        boolean actorIsAdmin = hasRole(actorRoles, ROLE_ADMIN);
        boolean actorIsMentor = !actorIsAdmin && hasRole(actorRoles, ROLE_MENTOR);

        if (!actorIsAdmin && !actorIsMentor) {
            throw new RuntimeException("권한이 없습니다.");
        }

        BgmAgitMember member = bgmAgitMemberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다."));

        if (member.getSocialType() != BgmAgitSocialType.MAHJONG) {
            throw new ValidException("마작 회원만 비밀번호를 변경할 수 있습니다.");
        }

        if (actorIsMentor) {
            BgmAgitMemberRole memberRole = bgmAgitMemberRoleRepository
                    .findByBgmAgitMemberId(member.getBgmAgitMemberId())
                    .orElseThrow(() -> new RuntimeException("해당 회원의 권한 정보가 없습니다."));
            if (!ROLE_NAME_USER.equals(memberRole.getBgmAgitRole().getBgmAgitRoleName())) {
                throw new RuntimeException("멘토는 유저의 비밀번호만 변경할 수 있습니다.");
            }
        }

        member.changePassword(passwordEncoder.encode(request.getPassword()));
        return new ApiResponse(200, true, "비밀번호가 변경되었습니다.");
    }

    private boolean hasRole(List<String> roles, String role) {
        return roles != null && roles.contains(role);
    }
}
