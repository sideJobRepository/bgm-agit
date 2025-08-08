package com.bgmagitapi.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.RefreshTokenRequest;
import com.bgmagitapi.security.handler.TokenPair;
import com.bgmagitapi.service.BgmAgitRefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitRefreshTokenController {
    
    private final BgmAgitRefreshTokenService refreshTokenService;

    
    @PostMapping("/refresh")
    public TokenPair refreshToken(@RequestBody RefreshTokenRequest request) {
        return refreshTokenService.reissueTokenPair(request.getRefreshToken());
    }
    
    @DeleteMapping("/refresh")
    public ApiResponse deleteRefreshToken(@RequestBody RefreshTokenRequest request) {
        return refreshTokenService.deleteRefesh(request);
    }
}