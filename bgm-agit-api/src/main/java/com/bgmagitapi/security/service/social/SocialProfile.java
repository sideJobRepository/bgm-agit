package com.bgmagitapi.security.service.social;

import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;

public record SocialProfile(
        BgmAgitSocialType provider,      // KAKAO / NAVER / GOOGLE
        String sub,               // 공급자 고유 ID
        String email,
        String name,
        String phone
) {}

