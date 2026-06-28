package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitGatheringApplyRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringModifyRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringParticipantUpdateRequest;
import com.bgmagitapi.controller.response.BgmAgitGatheringDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitGatheringListResponse;
import com.bgmagitapi.controller.response.BgmAgitGatheringParticipantResponse;
import com.bgmagitapi.entity.BgmAgitGathering;
import com.bgmagitapi.entity.BgmAgitGatheringParticipant;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.enumeration.GatheringParticipantStatus;
import com.bgmagitapi.entity.enumeration.GatheringStatus;
import com.bgmagitapi.entity.enumeration.GatheringType;
import com.bgmagitapi.event.dto.GatheringCancelledEvent;
import com.bgmagitapi.event.dto.GatheringConfirmedEvent;
import com.bgmagitapi.repository.BgmAgitGatheringParticipantRepository;
import com.bgmagitapi.repository.BgmAgitGatheringRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitGatheringService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitGatheringServiceImpl implements BgmAgitGatheringService {

    private final BgmAgitGatheringRepository bgmAgitGatheringRepository;
    private final BgmAgitGatheringParticipantRepository bgmAgitGatheringParticipantRepository;
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public Page<BgmAgitGatheringListResponse> getGatherings(Pageable pageable, String type, String status) {
        GatheringType gatheringType = parseType(type);
        GatheringStatus gatheringStatus = parseStatus(status);

        Page<BgmAgitGathering> page;
        if (gatheringType != null && gatheringStatus != null) {
            page = bgmAgitGatheringRepository.findByGatheringTypeAndGatheringStatus(gatheringType, gatheringStatus, pageable);
        } else if (gatheringType != null) {
            page = bgmAgitGatheringRepository.findByGatheringType(gatheringType, pageable);
        } else if (gatheringStatus != null) {
            page = bgmAgitGatheringRepository.findByGatheringStatus(gatheringStatus, pageable);
        } else {
            page = bgmAgitGatheringRepository.findAll(pageable);
        }

        List<BgmAgitGatheringListResponse> content = new ArrayList<>();
        for (BgmAgitGathering g : page.getContent()) {
            content.add(BgmAgitGatheringListResponse.of(g,
                    countConfirmed(g.getBgmAgitGatheringId()),
                    countWaiting(g.getBgmAgitGatheringId()),
                    bgmAgitGatheringParticipantRepository.countFlexibleActive(g.getBgmAgitGatheringId())));
        }
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public BgmAgitGatheringDetailResponse getGatheringDetail(Long gatheringId, Long memberId, List<String> roles) {
        BgmAgitGathering gathering = bgmAgitGatheringRepository.findById(gatheringId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 모임입니다."));

        long confirmedCount = countConfirmed(gatheringId);
        long waitingCount = countWaiting(gatheringId);
        long flexibleCount = bgmAgitGatheringParticipantRepository.countFlexibleActive(gatheringId);

        List<BgmAgitGatheringParticipant> all =
                bgmAgitGatheringParticipantRepository.findByBgmAgitGathering_BgmAgitGatheringIdOrderByAppliedOrderAsc(gatheringId);

        List<BgmAgitGatheringParticipantResponse> confirmed = new ArrayList<>();
        List<BgmAgitGatheringParticipantResponse> waiting = new ArrayList<>();
        for (BgmAgitGatheringParticipant p : all) {
            if (p.getParticipantStatus() == GatheringParticipantStatus.CONFIRMED) {
                confirmed.add(BgmAgitGatheringParticipantResponse.from(p));
            } else if (p.getParticipantStatus() == GatheringParticipantStatus.WAITING) {
                waiting.add(BgmAgitGatheringParticipantResponse.from(p));
            }
        }

        String myStatus = null;
        Boolean myFlexible = null;
        if (memberId != null) {
            BgmAgitGatheringParticipant mine = bgmAgitGatheringParticipantRepository
                    .findByBgmAgitGathering_BgmAgitGatheringIdAndBgmAgitMember_BgmAgitMemberId(gatheringId, memberId)
                    .orElse(null);
            if (mine != null && mine.getParticipantStatus() != GatheringParticipantStatus.CANCELLED) {
                myStatus = mine.getParticipantStatus().name();
                myFlexible = mine.getFlexible();
            }
        }

        BgmAgitGatheringDetailResponse.BgmAgitGatheringDetailResponseBuilder builder =
                BgmAgitGatheringDetailResponse.base(gathering, confirmedCount, waitingCount, flexibleCount)
                        .confirmed(confirmed)
                        .waiting(waiting)
                        .myStatus(myStatus)
                        .myFlexible(myFlexible);

        // 주최자 또는 관리자면 전체 참가자 명단(관리용) 포함
        if (canManage(gathering, memberId, roles)) {
            List<BgmAgitGatheringParticipantResponse> manageList = new ArrayList<>();
            for (BgmAgitGatheringParticipant p : all) {
                manageList.add(BgmAgitGatheringParticipantResponse.from(p));
            }
            builder.adminParticipants(manageList);
        }

        return builder.build();
    }

    @Override
    public ApiResponse createGathering(BgmAgitGatheringCreateRequest request, Long memberId) {
        BgmAgitMember host = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        GatheringType gatheringType = parseType(request.getGatheringType());
        if (gatheringType == null) {
            throw new IllegalArgumentException("모임 종류가 올바르지 않습니다.");
        }
        validatePeople(request.getMinPeople(), request.getMaxPeople());

        BgmAgitGathering gathering = new BgmAgitGathering(
                host,
                gatheringType,
                request.getTitle(),
                request.getScenarioName(),
                request.getPlace(),
                request.getDescription(),
                request.getGatheringDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getMinPeople(),
                request.getMaxPeople(),
                request.getRecruitDeadline()
        );
        bgmAgitGatheringRepository.save(gathering);
        return new ApiResponse(200, true, "모임이 생성되었습니다.");
    }

    @Override
    public ApiResponse modifyGathering(Long gatheringId, BgmAgitGatheringModifyRequest request, Long memberId, List<String> roles) {
        BgmAgitGathering gathering = bgmAgitGatheringRepository.findById(gatheringId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 모임입니다."));
        if (!canManage(gathering, memberId, roles)) {
            return new ApiResponse(403, false, "수정 권한이 없습니다.");
        }
        GatheringType gatheringType = parseType(request.getGatheringType());
        if (gatheringType == null) {
            throw new IllegalArgumentException("모임 종류가 올바르지 않습니다.");
        }
        validatePeople(request.getMinPeople(), request.getMaxPeople());

        gathering.update(
                gatheringType,
                request.getTitle(),
                request.getScenarioName(),
                request.getPlace(),
                request.getDescription(),
                request.getGatheringDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getMinPeople(),
                request.getMaxPeople(),
                request.getRecruitDeadline()
        );
        return new ApiResponse(200, true, "모임이 수정되었습니다.");
    }

    @Override
    public ApiResponse deleteGathering(Long gatheringId, Long memberId, List<String> roles) {
        BgmAgitGathering gathering = bgmAgitGatheringRepository.findById(gatheringId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 모임입니다."));
        if (!canManage(gathering, memberId, roles)) {
            return new ApiResponse(403, false, "무산 처리 권한이 없습니다.");
        }
        // 무산 처리 (이력 보존). 실제 삭제가 필요하면 참가자 먼저 정리 후 delete.
        gathering.markCancelled();
        eventPublisher.publishEvent(new GatheringCancelledEvent(gathering.getBgmAgitGatheringId()));
        return new ApiResponse(200, true, "모임이 취소(무산)되었습니다.");
    }

    @Override
    public ApiResponse apply(Long gatheringId, BgmAgitGatheringApplyRequest request, Long memberId) {
        // 비관적 락으로 정원 판정 직렬화 (선착순 마지막 좌석 경쟁 방지)
        BgmAgitGathering gathering = bgmAgitGatheringRepository.findByIdForUpdate(gatheringId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 모임입니다."));

        if (gathering.getGatheringStatus() == GatheringStatus.CANCELLED || gathering.getGatheringStatus() == GatheringStatus.COMPLETED) {
            return new ApiResponse(200, false, "신청할 수 없는 모임입니다.");
        }
        if (gathering.getRecruitDeadline() != null && LocalDateTime.now().isAfter(gathering.getRecruitDeadline())) {
            return new ApiResponse(200, false, "모집이 마감되었습니다.");
        }

        BgmAgitMember member = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        BgmAgitGatheringParticipant existing = bgmAgitGatheringParticipantRepository
                .findByBgmAgitGathering_BgmAgitGatheringIdAndBgmAgitMember_BgmAgitMemberId(gatheringId, memberId)
                .orElse(null);
        if (existing != null && existing.getParticipantStatus() != GatheringParticipantStatus.CANCELLED) {
            return new ApiResponse(200, false, "이미 신청한 모임입니다.");
        }

        // 시간 겹침 가드: 같은 날짜 다른 모임에 좌석확보면 차단
        List<BgmAgitGatheringParticipant> sameDate = bgmAgitGatheringParticipantRepository
                .findConfirmedSameDate(memberId, gathering.getGatheringDate(), gatheringId);
        for (BgmAgitGatheringParticipant other : sameDate) {
            if (timeOverlap(gathering, other.getBgmAgitGathering())) {
                return new ApiResponse(200, false, "같은 시간대에 이미 확정된 모임이 있습니다.");
            }
        }

        long confirmedCount = countConfirmed(gatheringId);
        boolean seatAvailable = gathering.getMaxPeople() == null || confirmedCount < gathering.getMaxPeople();
        GatheringParticipantStatus status = seatAvailable ? GatheringParticipantStatus.CONFIRMED : GatheringParticipantStatus.WAITING;
        Boolean flexible = request != null && Boolean.TRUE.equals(request.getFlexible());
        Long order = bgmAgitGatheringParticipantRepository.findMaxAppliedOrder(gatheringId) + 1;

        if (existing != null) {
            existing.reapply(status, flexible, order);
        } else {
            bgmAgitGatheringParticipantRepository.save(
                    new BgmAgitGatheringParticipant(gathering, member, status, flexible, order));
        }

        // 성사 판정: 좌석확보가 최소 인원에 처음 도달하면 성사 + 알림
        if (status == GatheringParticipantStatus.CONFIRMED && gathering.getGatheringStatus() == GatheringStatus.RECRUITING) {
            long newConfirmed = confirmedCount + 1;
            if (gathering.getMinPeople() != null && newConfirmed >= gathering.getMinPeople()) {
                gathering.markConfirmed();
                eventPublisher.publishEvent(new GatheringConfirmedEvent(gatheringId));
            }
        }

        String msg = status == GatheringParticipantStatus.CONFIRMED ? "참가가 확정되었습니다." : "대기자로 등록되었습니다.";
        return new ApiResponse(200, true, msg);
    }

    @Override
    public ApiResponse cancelApply(Long gatheringId, Long memberId) {
        BgmAgitGathering gathering = bgmAgitGatheringRepository.findByIdForUpdate(gatheringId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 모임입니다."));

        BgmAgitGatheringParticipant participant = bgmAgitGatheringParticipantRepository
                .findByBgmAgitGathering_BgmAgitGatheringIdAndBgmAgitMember_BgmAgitMemberId(gatheringId, memberId)
                .orElse(null);
        if (participant == null || participant.getParticipantStatus() == GatheringParticipantStatus.CANCELLED) {
            return new ApiResponse(200, false, "신청 내역이 없습니다.");
        }

        boolean wasConfirmed = participant.getParticipantStatus() == GatheringParticipantStatus.CONFIRMED;
        participant.changeStatus(GatheringParticipantStatus.CANCELLED);

        // 참가 취소 시 대기자 1명 자동 승급 (알림은 보내지 않음 — 알림톡은 모집/성사/취소 3종만)
        if (wasConfirmed) {
            List<BgmAgitGatheringParticipant> queue = bgmAgitGatheringParticipantRepository.findWaitingQueue(gatheringId);
            if (!queue.isEmpty()) {
                queue.get(0).promoteToConfirmed();
            }
        }
        // 성사 상태는 유지 (정책상 되돌리지 않음 — 관리자 판단)
        return new ApiResponse(200, true, "참가가 취소되었습니다.");
    }

    @Override
    public ApiResponse updateParticipant(Long gatheringId, Long participantId, BgmAgitGatheringParticipantUpdateRequest request, Long memberId, List<String> roles) {
        // 참가자 상태 변경 (주최자 또는 관리자)
        BgmAgitGatheringParticipant participant = bgmAgitGatheringParticipantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 참가자입니다."));
        if (!participant.getBgmAgitGathering().getBgmAgitGatheringId().equals(gatheringId)) {
            throw new IllegalArgumentException("모임과 참가자가 일치하지 않습니다.");
        }
        if (!canManage(participant.getBgmAgitGathering(), memberId, roles)) {
            return new ApiResponse(403, false, "참가자 관리 권한이 없습니다.");
        }
        if (request.getParticipantStatus() != null) {
            participant.changeStatus(GatheringParticipantStatus.valueOf(request.getParticipantStatus()));
        }
        if (request.getFlexible() != null) {
            participant.changeFlexible(request.getFlexible());
        }
        return new ApiResponse(200, true, "참가자 정보가 변경되었습니다.");
    }

    // =========================== helpers ===========================

    private long countConfirmed(Long gatheringId) {
        return bgmAgitGatheringParticipantRepository
                .countByBgmAgitGathering_BgmAgitGatheringIdAndParticipantStatus(gatheringId, GatheringParticipantStatus.CONFIRMED);
    }

    private long countWaiting(Long gatheringId) {
        return bgmAgitGatheringParticipantRepository
                .countByBgmAgitGathering_BgmAgitGatheringIdAndParticipantStatus(gatheringId, GatheringParticipantStatus.WAITING);
    }

    private boolean timeOverlap(BgmAgitGathering a, BgmAgitGathering b) {
        if (a.getGatheringDate() == null || b.getGatheringDate() == null) return false;
        if (!a.getGatheringDate().equals(b.getGatheringDate())) return false;
        LocalTime aStart = a.getStartTime();
        LocalTime aEnd = a.getEndTime() != null ? a.getEndTime() : aStart;
        LocalTime bStart = b.getStartTime();
        LocalTime bEnd = b.getEndTime() != null ? b.getEndTime() : bStart;
        if (aStart == null || bStart == null) return false;
        // 겹침: aStart < bEnd && bStart < aEnd, 또는 시작 동일
        return (aStart.isBefore(bEnd) && bStart.isBefore(aEnd)) || aStart.equals(bStart);
    }

    private void validatePeople(Integer min, Integer max) {
        if (min == null || max == null || min < 1 || max < 1 || min > max) {
            throw new IllegalArgumentException("최소/최대 인원 설정이 올바르지 않습니다.");
        }
    }

    private GatheringType parseType(String type) {
        if (type == null || type.isBlank()) return null;
        try {
            return GatheringType.valueOf(type.trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private GatheringStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return GatheringStatus.valueOf(status.trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private boolean isAdmin(List<String> roles) {
        if (roles == null) return false;
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }

    // 주최자(모임 만든 회원) 본인이거나 관리자면 관리 가능
    private boolean canManage(BgmAgitGathering gathering, Long memberId, List<String> roles) {
        if (isAdmin(roles)) return true;
        return memberId != null
                && gathering.getBgmAgitMember() != null
                && memberId.equals(gathering.getBgmAgitMember().getBgmAgitMemberId());
    }
}
