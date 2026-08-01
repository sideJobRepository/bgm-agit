package com.bgmagitapi.origin.clocktower.repository.query;

import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerParticipant;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRecord;
import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyCountResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberPlayHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface ClockTowerStatsQueryRepository {

    Page<BgmAgitClockTowerRecord> findRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month,
                                              Long viewerId, boolean isAdmin);

    List<BgmAgitClockTowerParticipant> findParticipantsByRecordIds(List<Long> recordIds);

    List<MemberMonthlyCountResponse> findMonthlyCounts(LocalDate startInclusive, LocalDate endExclusive);

    long countSessions(LocalDate startInclusive, LocalDate endExclusive);

    long countMemberSessions(Long memberId, LocalDate startInclusive, LocalDate endExclusive);

    List<MemberPlayHistoryResponse> findMemberGameHistory(Long memberId);

    List<MemberMonthlyBucketResponse> findMemberMonthlyBuckets(Long memberId);
}
