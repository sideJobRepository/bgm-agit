package com.bgmagitapi.service.impl;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.util.Base64URL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class RsaTest {
    
    @DisplayName("")
    @Test
    void test() throws JOSEException, NoSuchAlgorithmException, InvalidKeySpecException {
        // given - JWKS에서 가져온 n, e
        String n = "tWIfkwuUvYDpsOIRpcXS1ObQwjB57mNhvaXfBkT88vxxohl8pI7i-so9J-8HSZ9JfTHftWrJOr3WJQPnZnIy5PdgxqLbF5k2TwteXdOpDUamqOUCC6gPJc0sJGOXk8ayJ62HJMOZPYC2olCc_4e3fsnZfa6IGITzyb7IIkA_ZWjlCulzx5NUgsEJmK44obk5hHu1_dnxnt1RsQ-6vRG1AwEcNs-eKIGYshe2P6Y8rdOiy8UOvOs9QDL9x8xhb8yOGO1EEc453YlvX96MiRGPlREZSLImgcag4x5rU9lR-Z-pjsNMfjh3g-EvNNZoLOsJ6MOPoNaPzsUWv73ftwIcGQ";
        String e = "AQAB";
        
        // when - Base64 디코딩 후 BigInteger로 변환
        BigInteger modulus = new BigInteger(1, Base64.getUrlDecoder().decode(n));
        BigInteger exponent = new BigInteger(1, Base64.getUrlDecoder().decode(e));
        
        // RSA 공개키 생성
        RSAKey rsaKey = new RSAKey.Builder(
                new Base64URL(Base64.getUrlEncoder().withoutPadding().encodeToString(modulus.toByteArray())),
                new Base64URL(Base64.getUrlEncoder().withoutPadding().encodeToString(exponent.toByteArray()))
        ).build();
        
        RSAPublicKey publicKey = rsaKey.toRSAPublicKey();
        
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        X509EncodedKeySpec keySpec = keyFactory.getKeySpec(publicKey, X509EncodedKeySpec.class);
        byte[] encoded = keySpec.getEncoded();
        String pem = "-----BEGIN PUBLIC KEY-----\n" +
                Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(encoded) +
                "\n-----END PUBLIC KEY-----";
        
        System.out.println(pem);
    }
}
