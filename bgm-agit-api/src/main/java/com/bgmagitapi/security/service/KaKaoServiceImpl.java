package com.bgmagitapi.security.service;

import com.bgmagitapi.security.service.response.AccessTokenResponse;
import com.bgmagitapi.security.service.response.KaKaoProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;


@Service
@Transactional
@RequiredArgsConstructor
public class KaKaoServiceImpl implements KaKaoService {
    
    @Value("${kakao.clientId}")
    private String kakaoClientId;
    @Value("${kakao.redirecturi}")
    private String kakaoRedirectUri;
    
    
    @Override
    public AccessTokenResponse getAccessToken(String code) {
        
        RestClient restClient = RestClient.create();
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        
        params.add("code",code);
        params.add("client_id",kakaoClientId);
        params.add("redirect_uri",kakaoRedirectUri);
        params.add("grant_type", "authorization_code");
        
        return restClient.post()
                .uri("https://kauth.kakao.com/oauth/token")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .body(params)
                .retrieve()
                .toEntity(AccessTokenResponse.class)
                .getBody();
    }
    
    @Override
    public KaKaoProfileResponse getKaKaoProfile(String accessToken) {
        RestClient restClient = RestClient.create();
        
        return restClient.post()
                .uri("https://kapi.kakao.com/v2/user/me")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .toEntity(KaKaoProfileResponse.class)
                .getBody();
    }
}
