package com.bgmagitapi.entity;

import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import com.bgmagitapi.security.service.social.SocialProfile;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "BGM_AGIT_MEMBER")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@DynamicUpdate
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
    
    @Column(name = "BGM_AGIT_MEMBER_PHONE_NO")
    private String bgmAgitMemberPhoneNo;
    
    
    
    public BgmAgitMember(SocialProfile socialProfile) {
        this.bgmAgitMemberEmail = socialProfile.email();
        this.bgmAgitMemberName = socialProfile.name();
        this.bgmAgitMemberPassword = null;
        this.socialType = socialProfile.provider();
        this.bgmAgitMemberSocialId = socialProfile.sub();
        this.bgmAgitMemberPhoneNo = socialProfile.phone();
    }
    
    public void modifyMember(SocialProfile socialProfile) {
        this.bgmAgitMemberEmail = socialProfile.email();
        this.bgmAgitMemberName = socialProfile.name();
        this.bgmAgitMemberPassword = null;
        this.socialType = socialProfile.provider();
        this.bgmAgitMemberSocialId = socialProfile.sub();
        this.bgmAgitMemberPhoneNo = socialProfile.phone();
    }
}
