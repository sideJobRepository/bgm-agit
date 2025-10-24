package com.bgmagitapi.security.service;

import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.security.service.response.AccessTokenResponse;
import com.bgmagitapi.security.service.response.NaverProfileResponse;
import com.bgmagitapi.security.service.social.SocialProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Service("naverService")
@Transactional
@RequiredArgsConstructor
public class NaverServiceImpl implements SocialService{
    
    @Value("${naver.clientId}")
    private String naverClientId;
    @Value("${naver.redirecturi}")
    private String naverRedirectUri;
    @Value("${naver.client-secret}")
    private String naverClientSecret;
    @Override
    public AccessTokenResponse getAccessToken(String code) {
        RestClient restClient = RestClient.create();
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        
        params.add("code", code);
        params.add("client_id", naverClientId);
        params.add("redirect_uri", naverRedirectUri);
        params.add("grant_type", "authorization_code");
        params.add("client_secret",naverClientSecret);
        params.add("state", UUID.randomUUID().toString());
        
        ResponseEntity<AccessTokenResponse> response = restClient.post()
                .uri("https://nid.naver.com/oauth2.0/token")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .body(params)
                .retrieve()
                .toEntity(AccessTokenResponse.class);
        
        return response.getBody();
    }
    
    @Override
    public SocialProfile getProfile(String accessToken) {
        RestClient restClient = RestClient.create();
               
               NaverProfileResponse np = restClient.get()
                       .uri("https://openapi.naver.com/v1/nid/me")
                       .header("Content-Type", "application/x-www-form-urlencoded")
                       .header("Authorization", "Bearer " + accessToken)
                       .retrieve()
                       .body(NaverProfileResponse.class);
               
               
               String id = np != null ? np.getResponse().getId() : null;
               String email = np   != null ? np.getResponse().getEmail() : null;
               String name = np != null  ? np.getResponse().getName()  : null;
               String phone = np != null  ? np.getResponse().getMobile() : null;
               
               return new SocialProfile(
                       BgmAgitSocialType.NAVER,
                        id ,
                       email,
                       name,
                       phone
               );
    }
}
