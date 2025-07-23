package com.bgmagitapi.security.dto;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class BgmAgitMemberDto {
    
    
    private Long bgmAgitMemberId;
    
    private String bgmAgitMemberEmail;
    
    private String bgmAgitMemberName;
    
    private String bgmAgitMemberPassword;
    
    private String socialType;
    
    private String bgmAgitMemberSocialId;
    
    private List<String> roles;
    
    public static BgmAgitMemberDto createBgmAgitMemberDto(BgmAgitMember bgmAgitMember, List<String> roles){
        BgmAgitMemberDto bgmAgitMemberDto = new BgmAgitMemberDto();
        bgmAgitMemberDto.bgmAgitMemberId = bgmAgitMember.getBgmAgitMemberId();
        bgmAgitMemberDto.bgmAgitMemberEmail = bgmAgitMember.getBgmAgitMemberEmail();
        bgmAgitMemberDto.bgmAgitMemberName = bgmAgitMember.getBgmAgitMemberName();
        bgmAgitMemberDto.bgmAgitMemberSocialId = bgmAgitMember.getBgmAgitMemberSocialId();
        bgmAgitMemberDto.socialType = bgmAgitMember.getSocialType().name();
        bgmAgitMemberDto.roles = roles;
        return bgmAgitMemberDto;
    }
}
