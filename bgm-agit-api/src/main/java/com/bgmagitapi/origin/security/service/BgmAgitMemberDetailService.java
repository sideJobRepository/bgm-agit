package com.bgmagitapi.origin.security.service;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitMemberRole;
import com.bgmagitapi.origin.entity.BgmAgitRole;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.origin.repository.impl.BgmAgitMemberDetailRepositoryImpl;
import com.bgmagitapi.origin.security.context.BgmAgitMemberContext;
import com.bgmagitapi.origin.security.exception.SocialLoginNotAllowedException;
import com.bgmagitapi.origin.security.service.social.SocialProfile;
import lombok.RequiredArgsConstructor;
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


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
    
    public UserDetails loadUserByUsername(SocialProfile socialProfile) {

        // 소셜 로그인은 기존 가입 회원만 이용 가능. 신규 소셜 회원가입은 더 이상 받지 않는다.
        // 처음 보는 소셜 ID면 가입 생성 대신 안내 메시지와 함께 차단한다(자체 회원가입으로 유도).
        BgmAgitMember findBgmAgitMember = bgmAgitMemberRepository.findByBgmAgitMemberSocialId(String.valueOf(socialProfile.sub()))
                .orElseThrow(() -> new SocialLoginNotAllowedException(
                        "소셜 로그인은 기존 가입 회원만 이용할 수 있습니다. 신규 회원은 자체 회원가입을 이용해 주세요."));

        List<String> roleName = ensureDefaultRole(findBgmAgitMember);
        List<GrantedAuthority> authorityList = AuthorityUtils.createAuthorityList(roleName);

        return new BgmAgitMemberContext(findBgmAgitMember, authorityList);
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
