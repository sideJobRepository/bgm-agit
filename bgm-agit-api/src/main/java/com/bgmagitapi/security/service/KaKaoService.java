package com.bgmagitapi.security.service;

import com.bgmagitapi.security.service.response.AccessTokenResponse;
import com.bgmagitapi.security.service.response.KaKaoProfileResponse;

public interface KaKaoService {
    AccessTokenResponse getAccessToken(String code);
    KaKaoProfileResponse getKaKaoProfile(String accessToken);
}
