package com.bgmagitapi.repository.custom;

import com.bgmagitapi.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface BgmAgitMemberRoleCustomRepository {
    
    Page<BgmAgitRoleResponse> getRoles(Pageable pageable, String res);
    
    Optional<BgmAgitMemberRole> findByBgmAgitMemberId(Long memberId);
}
