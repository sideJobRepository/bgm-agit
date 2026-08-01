package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.BgmAgitRoleResponse;
import com.bgmagitapi.origin.entity.BgmAgitMemberRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface BgmAgitMemberRoleCustomRepository {

    Page<BgmAgitRoleResponse> getRoles(Pageable pageable, String res);

    Page<BgmAgitRoleResponse> getMahjongRoles(Pageable pageable, String res);

    Optional<BgmAgitMemberRole> findByBgmAgitMemberId(Long memberId);
}
