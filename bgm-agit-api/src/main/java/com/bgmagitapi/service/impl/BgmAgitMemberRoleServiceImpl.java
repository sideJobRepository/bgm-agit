package com.bgmagitapi.service.impl;

import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.repository.BgmAgitMemberRoleRepository;
import com.bgmagitapi.service.BgmAgitMemberRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitMemberRoleServiceImpl implements BgmAgitMemberRoleService {
    
    private final BgmAgitMemberRoleRepository bgmAgitMemberRoleRepository;
    
    @Override
    public BgmAgitMemberRole getMemberRole(Long memberId) {
        return bgmAgitMemberRoleRepository.findByBgmAgitMemberId(memberId).orElseThrow(() -> new RuntimeException("MemberRole not found"));
    }
}
