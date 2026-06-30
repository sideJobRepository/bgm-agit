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
    
    @Column(name = "BGM_AGIT_MEMBER_KML_ID")
    private Long bgmAgitMemberKmlId;

    @Column(name = "BGM_AGIT_MEMBER_KML_SYNK")
    private String bgmAgitMemberKmlSynk;
    
    // BGM 아지트 회원 알림톡 상태
    @Column(name = "BGM_AGIT_MEMBER_ALIMTALK_STATUS")
    private String bgmAgitMemberAlimtalkStatus;

    // 마작(BML) 이용 회원 여부. 'Y' = KML 등록 대상 + 마작/시계탑/머더 검색 노출, 'N'/null = 보드게임 등 일반 가입자
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
        this.bgmAgitMemberAlimtalkStatus = "Y";
    }

    public BgmAgitMember(String name, String nickname, String phoneNo, String hashedPassword, Long kmlId, boolean mahjongUse) {
        this.bgmAgitMemberName = name;
        this.bgmAgitMemberNickname = nickname;
        this.bgmAgitMemberPhoneNo = normalizePhone(phoneNo);
        this.bgmAgitMemberPassword = hashedPassword;
        this.bgmAgitMemberKmlId = kmlId;
        // 마작 이용 회원만 KML 동기화 대상. 보드게임 회원은 synk=null로 두어 스케줄러(synk='N' 재시도)가 건너뛰게 함
        this.bgmAgitMemberKmlSynk = mahjongUse ? (kmlId != null ? "Y" : "N") : null;
        this.bgmAgitMemberMahjongUseStatus = mahjongUse ? "Y" : "N";
        this.socialType = BgmAgitSocialType.MAHJONG;
        this.bgmAgitMemberNicknameUseStatus = "Y";
        this.bgmAgitMemberAlimtalkStatus = "Y";
    }

    public void linkKml(Long kmlId) {
        this.bgmAgitMemberKmlId = kmlId;
        this.bgmAgitMemberKmlSynk = "Y";
    }

    // 보드게임 회원 → 마작(BML) 이용 회원으로 전환. KML 등록 성공 시 즉시 연결, 실패 시 synk='N'으로 두어 스케줄러가 재시도
    public void enableMahjongUse(Long kmlId) {
        this.bgmAgitMemberMahjongUseStatus = "Y";
        if (kmlId != null) {
            this.bgmAgitMemberKmlId = kmlId;
            this.bgmAgitMemberKmlSynk = "Y";
        } else {
            this.bgmAgitMemberKmlSynk = "N";
        }
    }

    // 마작 이용 해지 (실수 신청 취소 / 관리자 해제). KML 삭제 API가 없어 kml_id는 유지하고,
    // 동기화 대기(synk='N')만 해제해 스케줄러가 더는 재시도하지 않게 한다.
    public void disableMahjongUse() {
        this.bgmAgitMemberMahjongUseStatus = "N";
        if ("N".equals(this.bgmAgitMemberKmlSynk)) {
            this.bgmAgitMemberKmlSynk = null;
        }
    }

    public void changePassword(String hashedPassword) {
        this.bgmAgitMemberPassword = hashedPassword;
    }

    public void changeNickname(String nickname) {
        this.bgmAgitMemberNickname = nickname;
    }

    public void markKmlSyncFailed() {
        this.bgmAgitMemberKmlSynk = "N";
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
        this.bgmAgitMemberAlimtalkStatus = request.getAlimtalkStatus();
    }
    
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        // +82로 시작하면 0으로 변경
        phone = phone.replaceAll("^\\+82\\s?", "0");
        return phone;
    }
    
    
}
