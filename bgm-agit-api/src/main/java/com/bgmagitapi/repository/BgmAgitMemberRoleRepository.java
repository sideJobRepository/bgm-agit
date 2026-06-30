package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.repository.custom.BgmAgitMemberRoleCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitMemberRoleRepository extends JpaRepository<BgmAgitMemberRole, Long>, BgmAgitMemberRoleCustomRepository {

    // 회원 삭제 시 해당 회원의 권한 매핑 행 제거 (FK RESTRICT 회피)
    void deleteByBgmAgitMember_BgmAgitMemberId(Long memberId);
}
