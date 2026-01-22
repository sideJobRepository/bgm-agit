package com.bgmagitapi.entity;

import com.bgmagitapi.controller.response.notice.BgmAgitMyPagePutRequest;
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
    
    @Column(name = "BGM_AGIT_MEMBER_NICKNAME")
    private String bgmAgitMemberNickname;
    
    @Column(name = "BGM_AGIT_MEMBER_NICKNAME_USE_STATUS")
    private String bgmAgitMemberNicknameUseStatus;
    
    @Column(name = "BGM_AGIT_MEMBER_MAHJONG_USE_STATUS")
    private String bgmAgitMemberMahjongUseStatus;
    
    
    
    public BgmAgitMember(SocialProfile socialProfile) {
        this.bgmAgitMemberEmail = socialProfile.email();
        this.bgmAgitMemberName = socialProfile.name();
        this.bgmAgitMemberPassword = null;
        this.socialType = socialProfile.provider();
        this.bgmAgitMemberSocialId = socialProfile.sub();
        this.bgmAgitMemberPhoneNo = normalizePhone(socialProfile.phone());
        this.bgmAgitMemberNickname = socialProfile.name();
        this.bgmAgitMemberNicknameUseStatus = "Y";
    }
    
    public void modifyMember(SocialProfile socialProfile) {
        this.bgmAgitMemberEmail = socialProfile.email();
        this.bgmAgitMemberName = socialProfile.name();
        this.bgmAgitMemberPassword = null;
        this.socialType = socialProfile.provider();
        this.bgmAgitMemberSocialId = socialProfile.sub();
        this.bgmAgitMemberPhoneNo = normalizePhone(socialProfile.phone());
        this.bgmAgitMemberNickname = socialProfile.name();
        this.bgmAgitMemberNicknameUseStatus = "Y";
    }
    public void modifyMyPage(BgmAgitMyPagePutRequest request) {
        this.bgmAgitMemberNickname =  request.getNickName();
        this.bgmAgitMemberPhoneNo =  request.getPhoneNo();
        this.bgmAgitMemberNicknameUseStatus =  request.getNickNameUseStatus();
        this.bgmAgitMemberMahjongUseStatus = request.getMahjongUseStatus();
    }
    
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        // +82로 시작하면 0으로 변경
        phone = phone.replaceAll("^\\+82\\s?", "0");
        return phone;
    }
    
    
}
