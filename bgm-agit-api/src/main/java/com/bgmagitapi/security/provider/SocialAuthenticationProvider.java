package com.bgmagitapi.security.provider;

import com.bgmagitapi.security.context.BgmAgitMemberContext;
import com.bgmagitapi.security.service.BgmAgitMemberDetailService;
import com.bgmagitapi.security.service.SocialService;
import com.bgmagitapi.security.service.response.AccessTokenResponse;
import com.bgmagitapi.security.service.response.KaKaoProfileResponse;
import com.bgmagitapi.security.token.SocialAuthenticationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

@Component(value = "socialAuthenticationProvider")
@RequiredArgsConstructor
public class SocialAuthenticationProvider implements AuthenticationProvider {
    
    private final SocialService kaKaoService;
    private final BgmAgitMemberDetailService bgmAgitMemberDetailService;
    
    
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        
        SocialAuthenticationToken token = (SocialAuthenticationToken) authentication;
        
        BgmAgitMemberContext bgmAgitMemberContext = new BgmAgitMemberContext(null,null);
        String socialType = token.getSocialLoginUrl().name();
        
        if ("KAKAO".equals(socialType)) {
            String authorizeCode = (String) token.getPrincipal();
            AccessTokenResponse accessToken = kaKaoService.getAccessToken(authorizeCode);
            KaKaoProfileResponse kaKaoProfile = kaKaoService.getKaKaoProfile(accessToken.getAccessToken());
            
            bgmAgitMemberContext = (BgmAgitMemberContext)
                    bgmAgitMemberDetailService.loadUserByUsername(kaKaoProfile);
        }else if("NAVER".equals(socialType)) {
        
        }else if ("GOOGLE".equals(socialType)) {
        
        }
        
        // 다른 소셜도 여기에 추가 가능: NAVER, GOOGLE 등
        
        return new SocialAuthenticationToken(
                bgmAgitMemberContext.getBgmAgitMember(),
                null,
                null,
                bgmAgitMemberContext.getAuthorities()
        );
    }
    
    @Override
    public boolean supports(Class<?> authentication) {
        return SocialAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
