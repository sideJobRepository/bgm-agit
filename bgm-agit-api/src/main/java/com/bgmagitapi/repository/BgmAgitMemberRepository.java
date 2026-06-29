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

    // 휴대폰 번호로 회원 조회 (소셜 1인 1계정 중복 가입 차단용)
    // findFirst = LIMIT 1 → 같은 폰번호 회원이 2명 이상이어도 NonUniqueResultException 안 남
    Optional<BgmAgitMember> findFirstByBgmAgitMemberPhoneNo(String phoneNo);

    Optional<BgmAgitMember> findByBgmAgitMemberNicknameAndSocialType(String nickname, BgmAgitSocialType socialType);

    boolean existsByBgmAgitMemberNicknameAndSocialType(String nickname, BgmAgitSocialType socialType);

    List<BgmAgitMember> findByBgmAgitMemberKmlSynk(String syncStatus);

    // 참가자 멀티셀렉트용 회원 검색 (닉네임/이름 부분일치, 상위 50명)
    List<BgmAgitMember> findTop50ByBgmAgitMemberNicknameContainingOrBgmAgitMemberNameContainingOrderByBgmAgitMemberNicknameAsc(
            String nickname, String name);
}
