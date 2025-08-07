package com.bgmagitapi.security.jwt;

import com.bgmagitapi.security.pem.PemKey;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

@Configuration
public class SignatureConfig {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.private-key}")
    private String rsaPrivateKey;

    
//    public MacSecuritySigner macSecuritySigner() {
//        return new MacSecuritySigner();
//    }
    
    

    public OctetSequenceKey OctetSequenceKey() throws JOSEException {
        SecretKey secretKey = new SecretKeySpec(Base64.getDecoder().decode(secret), "HmacSHA256");
        return new OctetSequenceKey.Builder(secretKey)
                .keyID("macKey")
                .algorithm(JWSAlgorithm.HS256)
                .build();
    }
    
    @Bean
    public RsaSecuritySigner rsaSigner() throws JOSEException {
        return new RsaSecuritySigner();
    }
    
    @Bean
    public RSAKey rsaKey() throws Exception {
        RSAPublicKey publicKey = PemKey.loadPublicKey("classpath:keys/public.pem");
        RSAPrivateKey privateKey = PemKey.loadPrivateKey(rsaPrivateKey);
        return new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID("rsaKey")
                .algorithm(JWSAlgorithm.RS256)
                .build();
    }
}
