package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.security.dto.TokenAndUser;
import com.bgmagitapi.origin.security.handler.TokenPair;

import java.time.LocalDateTime;

public interface BgmAgitRefreshTokenService {

    void refreshTokenSaveOrUpdate(BgmAgitMember member, String refreshTokenValue, LocalDateTime expiresAt, String platformId);
    TokenAndUser reissueTokenWithUser(String refreshToken, String platformId);
    ApiResponse deleteRefresh(String refreshToken, String platformId);
}
