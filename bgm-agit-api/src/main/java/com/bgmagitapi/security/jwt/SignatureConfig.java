package com.bgmagitapi.security.jwt;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class SignatureConfig {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Bean
    public MacSecuritySigner macSecuritySigner() {
        return new MacSecuritySigner();
    }
    
    
    @Bean
    public OctetSequenceKey OctetSequenceKey() throws JOSEException {
        SecretKey secretKey = new SecretKeySpec(Base64.getDecoder().decode(secret), "HmacSHA256");
        return new OctetSequenceKey.Builder(secretKey)
                .keyID("macKey")
                .algorithm(JWSAlgorithm.HS256)
                .build();
    }
}
