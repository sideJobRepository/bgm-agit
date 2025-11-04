package com.bgmagitapi.repository;

import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.repository.custom.BgmAgitMemberCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BgmAgitMemberRepository extends JpaRepository<BgmAgitMember, Long>, BgmAgitMemberCustomRepository {
    
    Optional<BgmAgitMember> findByBgmAgitMemberSocialId(String subId);
    
    
}
