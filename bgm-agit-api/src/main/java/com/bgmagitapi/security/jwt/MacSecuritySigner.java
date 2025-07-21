package com.bgmagitapi.security.jwt;

import com.bgmagitapi.entity.BgmAgitMember;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.OctetSequenceKey;

public class MacSecuritySigner extends SecuritySigner{
    @Override
    public String getToken(BgmAgitMember user, JWK jwk) throws JOSEException {
        MACSigner jwsSigner = new MACSigner(((OctetSequenceKey)jwk).toSecretKey()); // 대칭키
        
        return super.getJwtTokenInternal(jwsSigner,user,jwk);
    }
}
