package com.bgmagitapi.security.service;

import com.bgmagitapi.security.service.response.AccessTokenResponse;
import com.bgmagitapi.security.service.social.SocialProfile;

public interface SocialService {
    AccessTokenResponse getAccessToken(String code, String socialType);
    SocialProfile getProfile(String accessToken);
}
