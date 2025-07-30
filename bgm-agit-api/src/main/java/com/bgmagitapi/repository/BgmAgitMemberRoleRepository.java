package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMemberRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BgmAgitMemberRoleRepository extends JpaRepository<BgmAgitMemberRole, Long> {
    
    Optional<BgmAgitMemberRole> findByBgmAgitMember_BgmAgitMemberId(Long memberId);
}
