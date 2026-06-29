package com.bgmagitapi.security.service;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.event.dto.MemberJoinedEvent;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.repository.impl.BgmAgitMemberDetailRepositoryImpl;
import com.bgmagitapi.security.context.BgmAgitMemberContext;
import com.bgmagitapi.security.exception.DuplicateMemberException;
import com.bgmagitapi.security.service.social.SocialProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class BgmAgitMemberDetailService implements UserDetailsService {
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    
    private final BgmAgitMemberDetailRepositoryImpl bgmAgitMemberDetailRepository;
    
    private final ApplicationEventPublisher  eventPublisher;
    
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
    
    public UserDetails loadUserByUsername(SocialProfile socialProfile) {

        // 같은 소셜 계정(소셜 ID)으로 이미 가입된 회원이면 그대로 로그인,
        // 처음 보는 소셜 ID면 신규 가입을 시도하되 휴대폰 번호 중복은 차단한다.
        BgmAgitMember findBgmAgitMember = bgmAgitMemberRepository.findByBgmAgitMemberSocialId(String.valueOf(socialProfile.sub()))
                .orElseGet(() -> registerNewMember(socialProfile));

        List<String> roleName = ensureDefaultRole(findBgmAgitMember);
        List<GrantedAuthority> authorityList = AuthorityUtils.createAuthorityList(roleName);

        return new BgmAgitMemberContext(findBgmAgitMember, authorityList);
    }

    // 신규 소셜 회원 가입. 동일 휴대폰 번호로 이미 가입된 계정이 있으면 차단(1인 1계정).
    private BgmAgitMember registerNewMember(SocialProfile socialProfile) {
        // 카카오는 "+82 10-..." 형태로 주므로 "010-..."로 변환해서 비교 (네이버는 이미 010-...)
        String phoneNo = normalizePhone(socialProfile.phone());
        if (phoneNo != null) {
            BgmAgitMember existing = bgmAgitMemberRepository.findFirstByBgmAgitMemberPhoneNo(phoneNo).orElse(null);
            if (existing != null) {
                String provider = socialTypeLabel(existing.getSocialType());
                throw new DuplicateMemberException(
                        "이미 " + provider + "(으)로 가입된 계정이 있습니다. " + provider + " 로그인으로 이용해 주세요.");
            }
        }

        BgmAgitMember agitMember = new BgmAgitMember(socialProfile);
        BgmAgitMember saveMember = bgmAgitMemberRepository.save(agitMember);

        BgmAgitRole findbyBgmAgitRole = bgmAgitMemberDetailRepository.findByBgmAgitRoleName("USER");
        BgmAgitMemberRole bgmAgitMemberRole = new BgmAgitMemberRole(saveMember, findbyBgmAgitRole);
        bgmAgitMemberRoleRepository.save(bgmAgitMemberRole);

        eventPublisher.publishEvent(new MemberJoinedEvent(saveMember.getBgmAgitMemberId()));
        return saveMember;
    }

    // BgmAgitMember.normalizePhone 과 동일 규칙: 앞의 +82(공백 포함)를 0으로 변환
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        String normalized = phone.replaceAll("^\\+82\\s?", "0").trim();
        return normalized.isEmpty() ? null : normalized;
    }

    // 기존 가입 계정의 소셜 타입을 안내 문구용 한글로 (카카오/네이버 정확히 표기)
    private String socialTypeLabel(BgmAgitSocialType socialType) {
        if (socialType == null) return "다른 방법";
        return switch (socialType) {
            case KAKAO -> "카카오";
            case NAVER -> "네이버";
            case GOOGLE -> "구글";
            case MAHJONG -> "일반(마작) 회원가입";
        };
    }

    public List<String> ensureDefaultRole(BgmAgitMember member) {
        List<String> roleNames = bgmAgitMemberDetailRepository.getRoleName(member.getBgmAgitMemberId());
        if (roleNames == null || roleNames.isEmpty()) {
            BgmAgitRole userRole = bgmAgitMemberDetailRepository.findByBgmAgitRoleName("USER");
            bgmAgitMemberRoleRepository.save(new BgmAgitMemberRole(member, userRole));
            roleNames = bgmAgitMemberDetailRepository.getRoleName(member.getBgmAgitMemberId());
        }
        return roleNames;
    }
    
    
}
