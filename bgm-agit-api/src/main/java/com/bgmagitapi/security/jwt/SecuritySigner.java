package com.bgmagitapi.security.jwt;

import com.bgmagitapi.entity.BgmAgitMember;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.security.core.GrantedAuthority;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public abstract class SecuritySigner {
    /**
     * @param jwsSigner
     * @param user
     * @param jwk
     * @param authorities
     * @return
     */
    protected String getJwtTokenInternal(JWSSigner jwsSigner, BgmAgitMember user, JWK jwk, List<GrantedAuthority> authorities) throws JOSEException {
        JWSHeader header = new JWSHeader.Builder((JWSAlgorithm) jwk.getAlgorithm()).keyID(jwk.getKeyID()).build();
        
        List<String> roleList = new ArrayList<>();
        if (authorities != null && !authorities.isEmpty()) {
            for (GrantedAuthority auth : authorities) {
                roleList.add("ROLE_" + auth.getAuthority());
            }
        }
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject("user")
                .claim("id",user.getBgmAgitMemberId())
                .claim("name",user.getBgmAgitMemberName())
                .claim("socialId",user.getBgmAgitMemberSocialId())
                .claim("roles",roleList)
                .expirationTime(new Date(new Date().getTime() + 24 * 60 * 60 * 1000)) // 1일 (24시간) 유효 시간 설정
                .build();
        
        SignedJWT signedJWT = new SignedJWT(header, jwtClaimsSet);
        signedJWT.sign(jwsSigner);
        return signedJWT.serialize();
    }
    public abstract String getToken(BgmAgitMember user , JWK jwk, List<GrantedAuthority> authorities) throws JOSEException;
}
