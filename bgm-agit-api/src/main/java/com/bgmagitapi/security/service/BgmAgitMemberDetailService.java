package com.bgmagitapi.security.service;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.event.dto.MemberJoinedEvent;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.repository.impl.BgmAgitMemberDetailRepositoryImpl;
import com.bgmagitapi.security.context.BgmAgitMemberContext;
import com.bgmagitapi.security.service.social.SocialProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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
    
    private final ApplicationEventPublisher  eventPublisher;
    
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
    
    public UserDetails loadUserByUsername(SocialProfile socialProfile) {
        
        BgmAgitMember findBgmAgitMember = bgmAgitMemberRepository.findByBgmAgitMemberSocialId(String.valueOf(socialProfile.sub()))
                .orElseGet(() -> {
                    BgmAgitMember agitMember = new BgmAgitMember(socialProfile);
                    BgmAgitMember saveMember = bgmAgitMemberRepository.save(agitMember);
                    
                    BgmAgitRole findbyBgmAgitRole = bgmAgitMemberDetailRepository.findByBgmAgitRoleName("USER");
                    
                    BgmAgitMemberRole bgmAgitMemberRole = new BgmAgitMemberRole(saveMember, findbyBgmAgitRole);
                    
                    bgmAgitMemberRoleRepository.save(bgmAgitMemberRole);
                    eventPublisher.publishEvent(new MemberJoinedEvent(saveMember.getBgmAgitMemberId()));
                    return saveMember;
                });
        
        Long id = findBgmAgitMember.getBgmAgitMemberId();
        List<String> roleName = bgmAgitMemberDetailRepository.getRoleName(id);
        List<GrantedAuthority> authorityList = AuthorityUtils.createAuthorityList(roleName);
        
        return new BgmAgitMemberContext(findBgmAgitMember, authorityList);
    }
    
    
}
