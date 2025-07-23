package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BgmAgitMemberRepository extends JpaRepository<BgmAgitMember, Long> {
    
    Optional<BgmAgitMember> findByBgmAgitMemberSocialId(String subId);
}
