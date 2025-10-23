package com.bgmagitapi.security.provider;

import com.bgmagitapi.security.context.BgmAgitMemberContext;
import com.bgmagitapi.security.service.BgmAgitMemberDetailService;
import com.bgmagitapi.security.service.SocialService;
import com.bgmagitapi.security.service.response.AccessTokenResponse;
import com.bgmagitapi.security.service.social.SocialProfile;
import com.bgmagitapi.security.token.SocialAuthenticationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

@Component(value = "socialAuthenticationProvider")
@RequiredArgsConstructor
public class SocialAuthenticationProvider implements AuthenticationProvider {
    
    private final SocialService kakaoService;
    private final SocialService naverService;
    private final BgmAgitMemberDetailService bgmAgitMemberDetailService;
    
    
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        
        SocialAuthenticationToken token = (SocialAuthenticationToken) authentication;
        
        String socialType = token.getSocialLoginUrl().name();
        String authorizeCode = (String) token.getPrincipal();
        if ("KAKAO".equals(socialType)) {
            AccessTokenResponse accessToken = kakaoService.getAccessToken(authorizeCode);
            SocialProfile kaKaoProfile = kakaoService.getProfile(accessToken.getAccessToken());
            BgmAgitMemberContext bgmAgitMemberContext = (BgmAgitMemberContext) bgmAgitMemberDetailService.loadUserByUsername(kaKaoProfile);
            return new SocialAuthenticationToken(bgmAgitMemberContext.getBgmAgitMember(), null, null, bgmAgitMemberContext.getAuthorities());
        }else if("NAVER".equals(socialType)) {
            AccessTokenResponse accessToken = naverService.getAccessToken(authorizeCode);
            SocialProfile naverProfile = naverService.getProfile(accessToken.getAccessToken());
            BgmAgitMemberContext bgmagitMemberContext = (BgmAgitMemberContext) bgmAgitMemberDetailService.loadUserByUsername(naverProfile);
            return new SocialAuthenticationToken(bgmagitMemberContext.getBgmAgitMember(), null, null, bgmagitMemberContext.getAuthorities());
        }
        
        // 다른 소셜도 여기에 추가 가능: NAVER, GOOGLE 등
        throw new BadCredentialsException("존재 하지 않는 소셜 로그인 url 입니다. " + socialType);
        
    }
    
    @Override
    public boolean supports(Class<?> authentication) {
        return SocialAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
