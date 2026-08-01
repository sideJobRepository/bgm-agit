package com.bgmagitapi.origin.security.service;

import com.bgmagitapi.origin.security.service.response.AccessTokenResponse;
import com.bgmagitapi.origin.security.service.social.SocialProfile;

public interface SocialService {
    AccessTokenResponse getAccessToken(String code, String socialType);
    SocialProfile getProfile(String accessToken);
}
