package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.security.dto.TokenAndUser;
import com.bgmagitapi.security.handler.TokenPair;

import java.time.LocalDateTime;

public interface BgmAgitRefreshTokenService {

    void refreshTokenSaveOrUpdate(BgmAgitMember member, String refreshTokenValue, LocalDateTime expiresAt, String platformId);
    TokenAndUser reissueTokenWithUser(String refreshToken, String platformId);
    ApiResponse deleteRefresh(String refreshToken, String platformId);
}
