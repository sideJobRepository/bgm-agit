package com.bgmagitapi.entity;

import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "BGM_AGIT_MEMBER")
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
    
}
