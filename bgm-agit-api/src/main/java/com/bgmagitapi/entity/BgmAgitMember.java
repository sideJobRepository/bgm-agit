package com.bgmagitapi.entity;

import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.security.service.response.KaKaoProfileResponse;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "BGM_AGIT_MEMBER")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class BgmAgitMember extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MEMBER_ID")
    private Long bgmAgitMemberId;
    
    @Column(name = "BGM_AGIT_MEMBER_EMAIL")
    private String bgmAgitMemberEmail;
    
    @Column(name = "BGM_AGIT_MEMBER_NAME")
    private String bgmAgitMemberName;
    
    @Column(name = "BGM_AGIT_MEMBER_PASSWORD")
    private String bgmAgitMemberPassword;
    
    @Column(name = "BGM_AGIT_SOCIAL_TYPE")
    @Enumerated(EnumType.STRING)
    private BgmAgitSocialType socialType;
    
    @Column(name = "BGM_AGIT_MEMBER_SOCIAL_ID")
    private String bgmAgitMemberSocialId;
    
    
    
    public BgmAgitMember(KaKaoProfileResponse kaKaoProfileResponse) {
        this.bgmAgitMemberEmail = kaKaoProfileResponse.getKakaoAccount().getEmail();
        this.bgmAgitMemberName = kaKaoProfileResponse.getKakaoAccount().getProfile().getNickname();
        this.bgmAgitMemberPassword = null;
        this.socialType = BgmAgitSocialType.KAKAO;
        this.bgmAgitMemberSocialId = String.valueOf(kaKaoProfileResponse.getId());
    }
}
