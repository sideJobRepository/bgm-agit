package com.bgmagitapi.security.service;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.repository.impl.BgmAgitMemberDetailRepositoryImpl;
import com.bgmagitapi.security.context.BgmAgitMemberContext;
import com.bgmagitapi.security.service.response.KaKaoProfileResponse;
import com.bgmagitapi.service.BgmAgitBizTalkSandService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class BgmAgitMemberDetailService implements UserDetailsService {
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    
    private final BgmAgitMemberDetailRepositoryImpl bgmAgitMemberDetailRepository;
    
    private final BgmAgitBizTalkSandService bgmAgitBizTalkSandService;
    
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
    
    public UserDetails loadUserByUsername(KaKaoProfileResponse kaKaoProfile) {
        
        BgmAgitMember findBgmAgitMember = bgmAgitMemberRepository.findByBgmAgitMemberSocialId(String.valueOf(kaKaoProfile.getId()))
                .orElseGet(() -> {
                    BgmAgitMember agitMember = new BgmAgitMember(kaKaoProfile);
                    BgmAgitMember saveMember = bgmAgitMemberRepository.save(agitMember);
                    
                    BgmAgitRole findbyBgmAgitRole = bgmAgitMemberDetailRepository.findByBgmAgitRoleName("USER");
                    
                    BgmAgitMemberRole bgmAgitMemberRole = new BgmAgitMemberRole(saveMember, findbyBgmAgitRole);
                    
                    bgmAgitMemberRoleRepository.save(bgmAgitMemberRole);
                    bgmAgitBizTalkSandService.sendJoinMemberBizTalk(saveMember);
                    return saveMember;
                });
        
        findBgmAgitMember.modifyMember(kaKaoProfile);
        Long id = findBgmAgitMember.getBgmAgitMemberId();
        List<String> roleName = bgmAgitMemberDetailRepository.getRoleName(id);
        List<GrantedAuthority> authorityList = AuthorityUtils.createAuthorityList(roleName);
        
        
        
        return new BgmAgitMemberContext(findBgmAgitMember, authorityList);
    }
    
    
}
