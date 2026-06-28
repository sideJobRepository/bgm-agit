package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitGatheringParticipant;
import com.bgmagitapi.entity.enumeration.GatheringParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BgmAgitGatheringParticipantRepository extends JpaRepository<BgmAgitGatheringParticipant, Long> {

    long countByBgmAgitGathering_BgmAgitGatheringIdAndParticipantStatus(Long gatheringId, GatheringParticipantStatus status);

    // 유연(다른 장르도 가능) 신청 인원 — 좌석확보/대기 상태만 집계
    @Query("select count(p) from BgmAgitGatheringParticipant p " +
            "where p.bgmAgitGathering.bgmAgitGatheringId = :gatheringId " +
            "and p.flexible = true " +
            "and p.participantStatus in (" +
            "com.bgmagitapi.entity.enumeration.GatheringParticipantStatus.CONFIRMED, " +
            "com.bgmagitapi.entity.enumeration.GatheringParticipantStatus.WAITING)")
    long countFlexibleActive(@Param("gatheringId") Long gatheringId);

    List<BgmAgitGatheringParticipant> findByBgmAgitGathering_BgmAgitGatheringIdOrderByAppliedOrderAsc(Long gatheringId);

    Optional<BgmAgitGatheringParticipant> findByBgmAgitGathering_BgmAgitGatheringIdAndBgmAgitMember_BgmAgitMemberId(Long gatheringId, Long memberId);

    // 대기열에서 가장 먼저 신청한 1명 (승급 대상)
    @Query("select p from BgmAgitGatheringParticipant p " +
            "where p.bgmAgitGathering.bgmAgitGatheringId = :gatheringId " +
            "and p.participantStatus = com.bgmagitapi.entity.enumeration.GatheringParticipantStatus.WAITING " +
            "order by p.appliedOrder asc")
    List<BgmAgitGatheringParticipant> findWaitingQueue(@Param("gatheringId") Long gatheringId);

    @Query("select coalesce(max(p.appliedOrder), 0) from BgmAgitGatheringParticipant p " +
            "where p.bgmAgitGathering.bgmAgitGatheringId = :gatheringId")
    Long findMaxAppliedOrder(@Param("gatheringId") Long gatheringId);

    // 시간 겹침 가드: 회원이 같은 날짜 다른 모임에 좌석확보 상태인 경우
    @Query("select p from BgmAgitGatheringParticipant p " +
            "join p.bgmAgitGathering g " +
            "where p.bgmAgitMember.bgmAgitMemberId = :memberId " +
            "and p.participantStatus = com.bgmagitapi.entity.enumeration.GatheringParticipantStatus.CONFIRMED " +
            "and g.gatheringDate = :gatheringDate " +
            "and g.bgmAgitGatheringId <> :gatheringId")
    List<BgmAgitGatheringParticipant> findConfirmedSameDate(@Param("memberId") Long memberId,
                                                            @Param("gatheringDate") LocalDate gatheringDate,
                                                            @Param("gatheringId") Long gatheringId);
}
