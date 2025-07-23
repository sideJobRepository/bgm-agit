package com.bgmagitapi.security.service.social;

import java.util.Arrays;
import java.util.Optional;

public enum SocialLoginUrl {
    
    KAKAO("/bgm-agit/kakao-login"),
    NAVER("/bgm-agit/naver-login"),
    GOOGLE("/bgm-agit/google-login");
    
    private final String path;
    
    SocialLoginUrl(String path) {
        this.path = path;
    }
    
    public static Optional<SocialLoginUrl> getByPath(String url) {
        return Arrays.stream(SocialLoginUrl.values())
                .filter(type -> type.path.equals(url))
                .findFirst();
    }
    
    public static SocialLoginUrl getSocialType(String uri) {
        return Arrays.stream(SocialLoginUrl.values()).filter(type -> type.path.equals(uri))
                .findFirst().orElseThrow(() -> new  IllegalArgumentException("존재 하지 않는 소셜 로그인 입니다."));
    }
}
