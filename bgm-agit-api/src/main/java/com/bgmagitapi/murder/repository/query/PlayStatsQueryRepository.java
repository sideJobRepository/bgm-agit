package com.bgmagitapi.murder.repository.query;

import com.bgmagitapi.murder.dto.response.ExperiencedMemberResponse;
import com.bgmagitapi.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.murder.dto.response.MemberMonthlyCountResponse;
import com.bgmagitapi.murder.dto.response.MemberPlayHistoryResponse;
import com.bgmagitapi.murder.entity.BgmAgitPlayRecord;
import com.bgmagitapi.murder.entity.BgmAgitPlayRecordParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface PlayStatsQueryRepository {

    // 세션 목록 (게임/회원/연월 필터, 페이징)
    Page<BgmAgitPlayRecord> findPlayRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month);

    // 페이지 세션들의 참가자 (회원 fetch join)
    List<BgmAgitPlayRecordParticipant> findParticipantsByRecordIds(List<Long> recordIds);

    // 멤버별 게임수 (기간 내, 내림차순)
    List<MemberMonthlyCountResponse> findMonthlyCounts(LocalDate startInclusive, LocalDate endExclusive);

    // 기간 내 전체 세션 수
    long countSessions(LocalDate startInclusive, LocalDate endExclusive);

    // 특정 회원의 기간 내 게임수
    long countMemberSessions(Long memberId, LocalDate startInclusive, LocalDate endExclusive);

    // 회원의 게임별 플레이 이력 (횟수 + 최근일)
    List<MemberPlayHistoryResponse> findMemberGameHistory(Long memberId);

    // 회원의 월별 게임수 버킷
    List<MemberMonthlyBucketResponse> findMemberMonthlyBuckets(Long memberId);

    // 특정 게임을 이미 플레이한 경험이 있는 회원 (대상 memberIds 중). excludeRecordId: 수정 중인 기록 제외
    List<ExperiencedMemberResponse> findExperiencedMembers(Long gameId, List<Long> memberIds, Long excludeRecordId);
}
