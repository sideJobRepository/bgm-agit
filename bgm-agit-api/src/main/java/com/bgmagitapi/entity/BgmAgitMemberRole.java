package com.bgmagitapi.entity;

import com.bgmagitapi.entity.mapperd.DateSuperClass;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "BGM_AGIT_MEMBER_ROLE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BgmAgitMemberRole extends DateSuperClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BGM_AGIT_MEMBER_ROLE_ID")
    private Long bgmAgitMemberRoleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_MEMBER_ID")
    private BgmAgitMember bgmAgitMember;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BGM_AGIT_ROLE_ID")
    private BgmAgitRole bgmAgitRole;
    
    public BgmAgitMemberRole(Long bgmAgitMemberId, Long roleUserId) {
        BgmAgitMemberRole bgmAgitMemberRole = new BgmAgitMemberRole();
        BgmAgitMember memberId = new BgmAgitMember(bgmAgitMemberId);
        BgmAgitRole roleId = new BgmAgitRole(roleUserId);
        bgmAgitMemberRole.bgmAgitMember = memberId;
        bgmAgitMemberRole.bgmAgitRole = roleId;
    }
}
