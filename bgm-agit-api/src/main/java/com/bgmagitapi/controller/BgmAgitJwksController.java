package com.bgmagitapi.controller;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class BgmAgitJwksController {
    
    private final RSAKey rsaKey;
    
    @GetMapping("/.well-known/jwks.json")
    public Map<String, Object> getJwks() {
        // 공개키만 포함된 JWK Set 반환
        return new JWKSet(rsaKey.toPublicJWK()).toJSONObject();
    }
}
