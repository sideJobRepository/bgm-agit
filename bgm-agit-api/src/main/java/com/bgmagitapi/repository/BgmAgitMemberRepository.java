package com.bgmagitapi.repository;

import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.repository.custom.BgmAgitMemberCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BgmAgitMemberRepository extends JpaRepository<BgmAgitMember, Long>, BgmAgitMemberCustomRepository {

    Optional<BgmAgitMember> findByBgmAgitMemberSocialId(String subId);

    Optional<BgmAgitMember> findByBgmAgitMemberNicknameAndSocialType(String nickname, BgmAgitSocialType socialType);

    boolean existsByBgmAgitMemberNicknameAndSocialType(String nickname, BgmAgitSocialType socialType);

    List<BgmAgitMember> findByBgmAgitMemberKmlSynk(String syncStatus);
}
