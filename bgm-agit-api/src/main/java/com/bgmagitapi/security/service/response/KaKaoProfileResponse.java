package com.bgmagitapi.security.service.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class KaKaoProfileResponse {
    
    private Long id;
    
    @JsonProperty("kakao_account")
    private KakaoAccount kakaoAccount;
    
    @Getter
    @NoArgsConstructor
    public static class KakaoAccount {
        
        private String email;
        
        private Profile profile;
    }
    
    @Getter
    @NoArgsConstructor
    public static class Profile {
        
        private String nickname;
        
        @JsonProperty("profile_image_url")
        private String profileImageUrl;
        
        @JsonProperty("thumbnail_image_url")
        private String thumbnailImageUrl;
    }
}
