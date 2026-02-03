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
        
        SocialService socialService = getSocialService(socialType);
        AccessTokenResponse accessToken = socialService.getAccessToken(authorizeCode, socialType);
        SocialProfile profile = socialService.getProfile(accessToken.getAccessToken());
        
        BgmAgitMemberContext memberContext = (BgmAgitMemberContext) bgmAgitMemberDetailService.loadUserByUsername(profile);
        
        return new SocialAuthenticationToken(
                memberContext.getBgmAgitMember(),
                null,
                null,
                memberContext.getAuthorities()
        );
        
    }
    
    @Override
    public boolean supports(Class<?> authentication) {
        return SocialAuthenticationToken.class.isAssignableFrom(authentication);
    }
    
    private SocialService getSocialService(String socialType) {
        return switch (socialType) {
            case "KAKAO", "NEXT_KAKAO" -> kakaoService;
            case "NAVER", "NEXT_NAVER" -> naverService;
            default -> throw new BadCredentialsException("존재하지 않는 소셜 로그인 url입니다: " + socialType);
        };
    }
}
