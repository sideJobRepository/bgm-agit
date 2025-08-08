package com.bgmagitapi.security.jwt;

import com.bgmagitapi.repository.BgmAgitRsaRepository;
import com.bgmagitapi.security.pem.PemKey;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.RSAKey;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.io.InputStream;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

@Configuration
@RequiredArgsConstructor
public class SignatureConfig {
    
    @Value("${jwt.secret}")
    private String secret;
    
    private final BgmAgitRsaRepository bgmAgitRsaRepository;

    
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
        InputStream publicKeyStream = new ClassPathResource("keys/public.pem").getInputStream();
        RSAPublicKey publicKey = PemKey.loadPublicKey(publicKeyStream);
        RSAPrivateKey privateKey = PemKey.loadPrivateKey(bgmAgitRsaRepository.findAll().get(0).getBgmAgitRsaPrivateKey());
        return new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID("rsaKey")
                .algorithm(JWSAlgorithm.RS256)
                .build();
    }
}
