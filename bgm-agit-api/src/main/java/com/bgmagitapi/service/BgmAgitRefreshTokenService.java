package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.RefreshTokenRequest;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.security.handler.TokenPair;

import java.time.LocalDateTime;

public interface BgmAgitRefreshTokenService {
    
    void refreshTokenSaveOrUpdate(BgmAgitMember member, String refreshTokenValue, LocalDateTime expiresAt);
    
    
    BgmAgitMember validateRefreshToken(String refreshToken);
    
    TokenPair reissueTokenPair(String refreshToken);
    
    ApiResponse deleteRefesh(RefreshTokenRequest request);
}
