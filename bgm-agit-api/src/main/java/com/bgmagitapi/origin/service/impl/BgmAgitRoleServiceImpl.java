package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitMemberNicknameChangeRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitMemberPasswordChangeRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitMonthlyPassRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitRoleModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitMonthlyPassResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitMemberRole;
import com.bgmagitapi.origin.entity.BgmAgitMonthlyPass;
import com.bgmagitapi.origin.entity.BgmAgitRole;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.origin.repository.BgmAgitMonthlyPassRepository;
import com.bgmagitapi.origin.repository.BgmAgitRefreshTokenRepository;
import com.bgmagitapi.origin.repository.BgmAgitRoleRepository;
import com.bgmagitapi.origin.security.manager.BgmAgitAuthorizationManager;
import com.bgmagitapi.origin.security.service.kml.KmlUserClient;
import com.bgmagitapi.origin.service.BgmAgitRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitRoleServiceImpl implements BgmAgitRoleService {

    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_MENTOR = "ROLE_MENTOR";
    private static final String ROLE_NAME_USER = "USER";
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private final BgmAgitRoleRepository bgmAgitRoleRepository;

    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;

    private final BgmAgitMemberRepository bgmAgitMemberRepository;

    private final PasswordEncoder passwordEncoder;

    private final BgmAgitAuthorizationManager bgmAgitAuthorizationManager;

    private final KmlUserClient kmlUserClient;

    private final BgmAgitRefreshTokenRepository bgmAgitRefreshTokenRepository;

    private final BgmAgitMonthlyPassRepository bgmAgitMonthlyPassRepository;

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

    @Override
    public ApiResponse changeNickname(BgmAgitMemberNicknameChangeRequest request, List<String> actorRoles) {
        boolean actorIsAdmin = hasRole(actorRoles, ROLE_ADMIN);
        boolean actorIsMentor = !actorIsAdmin && hasRole(actorRoles, ROLE_MENTOR);

        if (!actorIsAdmin && !actorIsMentor) {
            throw new RuntimeException("권한이 없습니다.");
        }

        BgmAgitMember member = bgmAgitMemberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다."));

        if (member.getSocialType() != BgmAgitSocialType.MAHJONG) {
            throw new ValidException("마작 회원만 닉네임을 변경할 수 있습니다.");
        }

        if (actorIsMentor) {
            BgmAgitMemberRole memberRole = bgmAgitMemberRoleRepository
                    .findByBgmAgitMemberId(member.getBgmAgitMemberId())
                    .orElseThrow(() -> new RuntimeException("해당 회원의 권한 정보가 없습니다."));
            if (!ROLE_NAME_USER.equals(memberRole.getBgmAgitRole().getBgmAgitRoleName())) {
                throw new RuntimeException("멘토는 유저의 닉네임만 변경할 수 있습니다.");
            }
        }

        String newNickname = request.getNickname().trim();

        if (newNickname.equals(member.getBgmAgitMemberNickname())) {
            throw new ValidException("기존 닉네임과 동일합니다.");
        }

        if (bgmAgitMemberRepository.existsByBgmAgitMemberNicknameAndSocialType(newNickname, BgmAgitSocialType.MAHJONG)) {
            throw new ValidException("이미 사용 중인 닉네임입니다.");
        }

        member.changeNickname(newNickname);

        // 마작(BML) 이용 회원만 KML 동기화. 보드게임 회원(mahjongUse!='Y')은 닉네임만 바꾸고 KML 등록 생략(defer 유지).
        if ("Y".equals(member.getBgmAgitMemberMahjongUseStatus())) {
            Long kmlId = kmlUserClient.findOrRegisterKmlIdByNickname(newNickname).orElse(null);
            if (kmlId != null) {
                member.linkKml(kmlId);
            } else {
                member.markKmlSyncFailed();
            }
        }

        return new ApiResponse(200, true, "닉네임이 변경되었습니다.");
    }

    @Override
    public ApiResponse deleteSocialMember(Long memberId, List<String> actorRoles) {
        if (!hasRole(actorRoles, ROLE_ADMIN)) {
            throw new RuntimeException("관리자만 회원을 삭제할 수 있습니다.");
        }

        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다."));

        // 이 메뉴(소셜 탭)는 소셜 회원 정리용. 자체로그인(마작) 회원은 삭제 차단.
        if (member.getSocialType() == BgmAgitSocialType.MAHJONG) {
            throw new ValidException("자체로그인(마작) 회원은 이 메뉴에서 삭제할 수 없습니다.");
        }

        // 회원 고유 인증 데이터(권한 매핑·리프레시 토큰)는 함께 제거 (FK RESTRICT)
        bgmAgitRefreshTokenRepository.deleteByBgmAgitMember_BgmAgitMemberId(memberId);
        bgmAgitMemberRoleRepository.deleteByBgmAgitMember_BgmAgitMemberId(memberId);

        // 예약·문의·게시글 등 콘텐츠 자식이 남아있으면 FK 위반 → 정리 후 삭제 안내
        try {
            bgmAgitMemberRepository.delete(member);
            bgmAgitMemberRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ValidException("예약·문의·게시글 등 연관 데이터가 있어 삭제할 수 없습니다. 먼저 해당 데이터를 정리한 뒤 삭제해 주세요.");
        }

        bgmAgitAuthorizationManager.reload();
        return new ApiResponse(200, true, "회원이 삭제되었습니다.");
    }

    @Override
    public ApiResponse setMahjongUse(Long memberId, boolean use, List<String> actorRoles) {
        if (!hasRole(actorRoles, ROLE_ADMIN)) {
            throw new RuntimeException("관리자만 마작 연동을 변경할 수 있습니다.");
        }

        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다."));

        if (member.getSocialType() != BgmAgitSocialType.MAHJONG) {
            throw new ValidException("자체로그인 회원만 마작 연동을 설정할 수 있습니다.");
        }

        if (use) {
            Long kmlId = kmlUserClient.findOrRegisterKmlIdByNickname(member.getBgmAgitMemberNickname()).orElse(null);
            member.enableMahjongUse(kmlId);
            return new ApiResponse(200, true, "마작 기록 연동되었습니다.");
        } else {
            member.disableMahjongUse();
            return new ApiResponse(200, true, "마작 기록 연동이 해제되었습니다.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BgmAgitMonthlyPassResponse> getMonthlyPassMembers(Pageable pageable, String keyword, boolean onlyPass, List<String> actorRoles) {
        // 전화번호가 나가는 목록이라 URL 매핑과 별개로 서비스에서도 막는다(매핑이 빠지면 기본 permit 이다)
        requireAdmin(actorRoles);
        YearMonth thisMonth = YearMonth.now(KST);
        Page<BgmAgitMonthlyPassResponse> page =
                bgmAgitMemberRepository.findMonthlyPassMembers(pageable, keyword, onlyPass, thisMonth);
        Map<Long, List<BgmAgitMonthlyPass>> passes = bgmAgitMonthlyPassRepository.findActivePassesByMemberIds(
                page.getContent().stream().map(BgmAgitMonthlyPassResponse::getMemberId).toList(), thisMonth);
        page.getContent().forEach(item -> {
            item.setMemberPhoneNo(formatPhoneNo(item.getMemberPhoneNo()));
            List<BgmAgitMonthlyPass> mine = passes.getOrDefault(item.getMemberId(), List.of());
            item.setPasses(mine.stream()
                    .map(p -> new BgmAgitMonthlyPassResponse.Period(
                            p.getBgmAgitMonthlyPassId(), p.getStartYearMonth().toString(), p.getEndYearMonth().toString()))
                    .toList());
            boolean coversNow = mine.stream().anyMatch(p ->
                    !p.getStartYearMonth().isAfter(thisMonth) && !p.getEndYearMonth().isBefore(thisMonth));
            item.setMonthlyPassStatus(coversNow ? "Y" : "N");
        });
        return page;
    }

    @Override
    public ApiResponse addMonthlyPass(BgmAgitMonthlyPassRequest request, List<String> actorRoles) {
        requireAdmin(actorRoles);
        BgmAgitMember member = bgmAgitMemberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ValidException("해당 회원을 찾을 수 없습니다."));
        YearMonth start;
        try {
            start = YearMonth.parse(request.getStartMonth());
        } catch (RuntimeException e) {
            throw new ValidException("시작월 형식이 올바르지 않습니다.");
        }
        // 지난 달부터 시작하는 기간은 받지 않는다(이미 지난 이용분은 할인될 일이 없다)
        if (start.isBefore(YearMonth.now(KST))) {
            throw new ValidException("시작월은 이번 달 이후로 선택해 주세요.");
        }
        BgmAgitMonthlyPass pass = bgmAgitMonthlyPassRepository.save(new BgmAgitMonthlyPass(member, start, request.getMonths()));
        return new ApiResponse(200, true, "월간패스가 등록되었습니다. ("
                + pass.getStartYearMonth() + " ~ " + pass.getEndYearMonth() + ")");
    }

    @Override
    public ApiResponse deleteMonthlyPass(Long passId, List<String> actorRoles) {
        requireAdmin(actorRoles);
        BgmAgitMonthlyPass pass = bgmAgitMonthlyPassRepository.findById(passId)
                .orElseThrow(() -> new ValidException("해당 월간패스를 찾을 수 없습니다."));
        bgmAgitMonthlyPassRepository.delete(pass);
        return new ApiResponse(200, true, "월간패스가 삭제되었습니다.");
    }

    private void requireAdmin(List<String> actorRoles) {
        if (!hasRole(actorRoles, ROLE_ADMIN)) {
            throw new ForbiddenException("관리자만 사용할 수 있습니다.");
        }
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

    private boolean hasRole(List<String> roles, String role) {
        return roles != null && roles.contains(role);
    }
}
