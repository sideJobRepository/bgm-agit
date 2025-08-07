package com.bgmagitapi.security.jwt;

import com.bgmagitapi.entity.BgmAgitMember;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.RSAKey;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

public class RsaSecuritySigner extends SecuritySigner{
    @Override
    public String getToken(BgmAgitMember user, JWK jwk, List<GrantedAuthority> authorities) throws JOSEException {
        RSASSASigner jwsSigner = new RSASSASigner(((RSAKey)jwk).toRSAPrivateKey());
        
        return super.getJwtTokenInternal(jwsSigner,user,jwk,authorities);
    }
}
