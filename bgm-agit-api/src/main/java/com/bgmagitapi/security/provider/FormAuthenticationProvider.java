package com.bgmagitapi.security.provider;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.security.service.BgmAgitMemberDetailService;
import com.bgmagitapi.security.token.FormAuthenticationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("formAuthenticationProvider")
@RequiredArgsConstructor
public class FormAuthenticationProvider implements AuthenticationProvider {

    private static final String INVALID_CREDENTIALS_MESSAGE = "닉네임 또는 비밀번호가 올바르지 않습니다.";

    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final BgmAgitMemberDetailService bgmAgitMemberDetailService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        FormAuthenticationToken token = (FormAuthenticationToken) authentication;
        String nickname = (String) token.getPrincipal();
        String rawPassword = (String) token.getCredentials();

        BgmAgitMember member = bgmAgitMemberRepository
                .findByBgmAgitMemberNicknameAndSocialType(nickname, BgmAgitSocialType.MAHJONG)
                .orElseThrow(() -> new BadCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (member.getBgmAgitMemberPassword() == null
                || !passwordEncoder.matches(rawPassword, member.getBgmAgitMemberPassword())) {
            throw new BadCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        List<String> roleNames = bgmAgitMemberDetailService.ensureDefaultRole(member);
        List<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList(roleNames);

        return new FormAuthenticationToken(member, authorities);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return FormAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
