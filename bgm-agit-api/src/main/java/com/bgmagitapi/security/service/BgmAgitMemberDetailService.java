package com.bgmagitapi.security.service;

import com.bgmagitapi.entity.*;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.repository.BgmAgitRoleRepository;
import com.bgmagitapi.security.context.BgmAgitMemberContext;
import com.bgmagitapi.security.service.response.KaKaoProfileResponse;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.*;
import static com.bgmagitapi.entity.QBgmAgitMemberRole.*;
import static com.bgmagitapi.entity.QBgmAgitRole.*;


@Service
@RequiredArgsConstructor
@Transactional
public class BgmAgitMemberDetailService implements UserDetailsService {
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitRoleRepository bgmAgitRoleRepository;
    
    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
    
    public UserDetails loadUserByUsername(KaKaoProfileResponse kaKaoProfile) {
        
        BgmAgitMember findBgmAgitMember = bgmAgitMemberRepository.findByBgmAgitMemberSocialId(String.valueOf(kaKaoProfile.getId()))
                .orElseGet(() -> {
                    BgmAgitMember agitMember = new BgmAgitMember(kaKaoProfile);
                    BgmAgitMember saveMember = bgmAgitMemberRepository.save(agitMember);
                    
                    BgmAgitRole findbyBgmAgitRole = bgmAgitRoleRepository.findByBgmAgitRoleName("USER");
                    
                    BgmAgitMemberRole bgmAgitMemberRole = new BgmAgitMemberRole(saveMember, findbyBgmAgitRole);
                    
                    bgmAgitMemberRoleRepository.save(bgmAgitMemberRole);
                    return saveMember;
                });
        
        findBgmAgitMember.modifyMember(kaKaoProfile);
        
        
        List<String> roleNames = queryFactory
                .select(bgmAgitRole.bgmAgitRoleName)
                .from(bgmAgitMember)
                .join(bgmAgitMemberRole).on(bgmAgitMember.eq(bgmAgitMemberRole.bgmAgitMember))
                .join(bgmAgitRole).on(bgmAgitRole.eq(bgmAgitMemberRole.bgmAgitRole))
                .where(bgmAgitMember.bgmAgitMemberId.eq(findBgmAgitMember.getBgmAgitMemberId()))
                .fetch();
        
        List<GrantedAuthority> authorityList = AuthorityUtils.createAuthorityList(roleNames);
        
        return new BgmAgitMemberContext(findBgmAgitMember, authorityList);
    }
    
    
}
