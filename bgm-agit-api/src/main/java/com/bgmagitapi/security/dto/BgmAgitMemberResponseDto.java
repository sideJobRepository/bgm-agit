package com.bgmagitapi.security.dto;

import com.bgmagitapi.entity.BgmAgitMember;
import jakarta.persistence.SecondaryTable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BgmAgitMemberResponseDto {
    
    
    private Long id;
    private String name;
    private List<String> roles;
    private String socialId;
    private String sub;
    //private String phoneNumber;
    
    public static BgmAgitMemberResponseDto create(BgmAgitMember member,List<GrantedAuthority> authorities) {
        BgmAgitMemberResponseDto bgmAgitMemberResponseDto = new BgmAgitMemberResponseDto();
        bgmAgitMemberResponseDto.setId(member.getBgmAgitMemberId());
        bgmAgitMemberResponseDto.setName(member.getBgmAgitMemberName());
        List<String> roleList = new ArrayList<>();
        if (authorities != null && !authorities.isEmpty()) {
            for (GrantedAuthority auth : authorities) {
                roleList.add("ROLE_" + auth.getAuthority());
            }
        }
        bgmAgitMemberResponseDto.setRoles(roleList);
        bgmAgitMemberResponseDto.setSocialId(member.getBgmAgitMemberSocialId());
      //  bgmAgitMemberResponseDto.setPhoneNumber(member.getBgmAgitMemberPhoneNo());
        bgmAgitMemberResponseDto.setSub("user");
        return bgmAgitMemberResponseDto;
    }
}
