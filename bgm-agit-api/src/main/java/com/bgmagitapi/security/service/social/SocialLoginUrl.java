package com.bgmagitapi.security.service.social;

import java.util.Arrays;
import java.util.Optional;

public enum SocialLoginUrl {
    
    KAKAO("/bgm-agit/kakao-login"),
    NAVER("/bgm-agit/naver-login"),
    NEXT_KAKAO("/bgm-agit/kakao-login"),
    NEXT_NAVER("/bgm-agit/naver-login");
    
    private final String path;
    
    SocialLoginUrl(String path) {
        this.path = path;
    }
    
    
    public static SocialLoginUrl getSocialType(String uri) {
        return Arrays.stream(SocialLoginUrl.values()).filter(type -> type.path.equals(uri))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("존재 하지 않는 소셜 로그인 입니다."));
    }
}
