package com.bgmagitapi.murder.repository;

import com.bgmagitapi.murder.entity.BgmAgitPlayRecordParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitPlayRecordParticipantRepository extends JpaRepository<BgmAgitPlayRecordParticipant, Long> {

    // 세션 수정 시 기존 참가자 전부 삭제 후 재삽입
    void deleteByPlayRecord_Id(Long playRecordId);
}
