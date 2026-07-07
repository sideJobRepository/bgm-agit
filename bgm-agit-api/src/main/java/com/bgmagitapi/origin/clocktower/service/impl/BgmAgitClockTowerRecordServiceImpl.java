package com.bgmagitapi.origin.clocktower.service.impl;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerParticipantInput;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRecordCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRecordModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerParticipantResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRecordDetailResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRecordListResponse;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerParticipant;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRecord;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerCharacterRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerGameRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerParticipantRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerRecordRepository;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerRecordService;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerResult;
import com.bgmagitapi.origin.murder.dto.response.MemberHistoryResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberPlayHistoryResponse;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitClockTowerRecordServiceImpl implements BgmAgitClockTowerRecordService {

    private final BgmAgitClockTowerRecordRepository recordRepository;
    private final BgmAgitClockTowerParticipantRepository participantRepository;
    private final BgmAgitClockTowerGameRepository gameRepository;
    private final BgmAgitClockTowerCharacterRepository characterRepository;
    private final BgmAgitMemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ClockTowerRecordListResponse> getRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month,
                                                         Long viewerId, boolean isAdmin) {
        Page<BgmAgitClockTowerRecord> page = recordRepository.findRecords(pageable, gameId, memberId, year, month, viewerId, isAdmin);

        List<Long> ids = page.getContent().stream().map(BgmAgitClockTowerRecord::getId).toList();
        Map<Long, List<String>> nicknamesByRecord = new LinkedHashMap<>();
        for (BgmAgitClockTowerParticipant p : recordRepository.findParticipantsByRecordIds(ids)) {
            Long recordId = p.getRecord().getId();
            String nickname = p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberNickname() : null;
            nicknamesByRecord.computeIfAbsent(recordId, k -> new ArrayList<>()).add(nickname);
        }

        List<ClockTowerRecordListResponse> content = new ArrayList<>();
        for (BgmAgitClockTowerRecord r : page.getContent()) {
            List<String> nicks = nicknamesByRecord.getOrDefault(r.getId(), List.of());
            BgmAgitClockTowerGame g = r.getGame();
            content.add(ClockTowerRecordListResponse.builder()
                    .id(r.getId())
                    .gameId(g != null ? g.getId() : null)
                    .gameName(g != null ? g.getName() : null)
                    .gameImageUrl(g != null ? g.getImageUrl() : null)
                    .playDate(r.getPlayDate())
                    .result(r.getResult() != null ? r.getResult().name() : null)
                    .resultName(r.getResult() != null ? r.getResult().getValue() : null)
                    .draft(Boolean.TRUE.equals(r.getDraft()))
                    .writerId(r.getBgmAgitMember() != null ? r.getBgmAgitMember().getBgmAgitMemberId() : null)
                    .writerNickname(r.getBgmAgitMember() != null ? r.getBgmAgitMember().getBgmAgitMemberNickname() : null)
                    .memo(r.getMemo())
                    .participantCount(nicks.size())
                    .participantNicknames(nicks)
                    .build());
        }
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public ClockTowerRecordDetailResponse getRecord(Long id, Long memberId, List<String> roles) {
        BgmAgitClockTowerRecord r = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));

        List<ClockTowerParticipantResponse> participants = recordRepository.findParticipantsByRecordIds(List.of(id))
                .stream()
                .map(p -> ClockTowerParticipantResponse.from(p, r.getResult()))
                .toList();

        BgmAgitClockTowerGame g = r.getGame();
        return ClockTowerRecordDetailResponse.builder()
                .id(r.getId())
                .gameId(g != null ? g.getId() : null)
                .gameName(g != null ? g.getName() : null)
                .gameImageUrl(g != null ? g.getImageUrl() : null)
                .gameMinPlayers(g != null ? g.getMinPlayers() : null)
                .gameMaxPlayers(g != null ? g.getMaxPlayers() : null)
                .playDate(r.getPlayDate())
                .result(r.getResult() != null ? r.getResult().name() : null)
                .resultName(r.getResult() != null ? r.getResult().getValue() : null)
                .draft(Boolean.TRUE.equals(r.getDraft()))
                .writerId(r.getBgmAgitMember() != null ? r.getBgmAgitMember().getBgmAgitMemberId() : null)
                .writerNickname(r.getBgmAgitMember() != null ? r.getBgmAgitMember().getBgmAgitMemberNickname() : null)
                .memo(r.getMemo())
                .participants(participants)
                .canManage(canManage(r, memberId, roles))
                .build();
    }

    @Override
    public ApiResponse createRecord(ClockTowerRecordCreateRequest request, Long memberId) {
        BgmAgitMember writer = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        // 시계탑 기록은 자체로그인(마작) 회원만 등록 가능
        if (writer.getSocialType() != BgmAgitSocialType.MAHJONG) {
            return new ApiResponse(403, false, "자체로그인(마작) 회원만 시계탑 기록을 등록할 수 있습니다.");
        }
        BgmAgitClockTowerGame game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
        boolean draft = request.isDraft();
        ClockTowerResult result = resolveResult(request.getResult(), draft);

        BgmAgitClockTowerRecord record = new BgmAgitClockTowerRecord(
                game, writer, request.getPlayDate(), result, request.getMemo(), draft);
        recordRepository.save(record);

        saveParticipants(record, memberId, request.getParticipants());
        return new ApiResponse(200, true, "기록이 등록되었습니다.");
    }

    @Override
    public ApiResponse modifyRecord(Long id, ClockTowerRecordModifyRequest request, Long memberId, List<String> roles) {
        BgmAgitClockTowerRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));
        ApiResponse memberTypeGuard = requireClockTowerWriter(memberId, roles);
        if (memberTypeGuard != null) return memberTypeGuard;
        if (!canManage(record, memberId, roles)) {
            return new ApiResponse(403, false, "수정 권한이 없습니다.");
        }
        BgmAgitClockTowerGame game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
        boolean draft = request.isDraft();
        ClockTowerResult result = resolveResult(request.getResult(), draft);

        record.update(game, request.getPlayDate(), result, request.getMemo(), draft);

        participantRepository.deleteByRecord_Id(id);
        participantRepository.flush();
        Long writerId = record.getBgmAgitMember() != null ? record.getBgmAgitMember().getBgmAgitMemberId() : memberId;
        saveParticipants(record, writerId, request.getParticipants());
        return new ApiResponse(200, true, "기록이 수정되었습니다.");
    }

    @Override
    public ApiResponse deleteRecord(Long id, Long memberId, List<String> roles) {
        BgmAgitClockTowerRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));
        ApiResponse memberTypeGuard = requireClockTowerWriter(memberId, roles);
        if (memberTypeGuard != null) return memberTypeGuard;
        if (!canManage(record, memberId, roles)) {
            return new ApiResponse(403, false, "삭제 권한이 없습니다.");
        }
        participantRepository.deleteByRecord_Id(id);
        participantRepository.flush();
        recordRepository.delete(record);
        return new ApiResponse(200, true, "기록이 삭제되었습니다.");
    }

    @Override
    @Transactional(readOnly = true)
    public MemberHistoryResponse getMemberHistory(Long memberId) {
        List<MemberPlayHistoryResponse> games = recordRepository.findMemberGameHistory(memberId);
        List<MemberMonthlyBucketResponse> monthly = recordRepository.findMemberMonthlyBuckets(memberId);

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        long thisMonth = recordRepository.countMemberSessions(memberId, monthStart, monthStart.plusMonths(1));
        long total = games.stream().mapToLong(g -> g.getPlayCount() != null ? g.getPlayCount() : 0L).sum();

        return MemberHistoryResponse.builder()
                .thisMonthCount(thisMonth)
                .totalCount(total)
                .games(games)
                .monthly(monthly)
                .build();
    }

    // =========================== helpers ===========================

    /** 진행자(이야기꾼) 캐릭터명 스냅샷 라벨. 역할군은 null 이라 진영·승패가 없다. */
    private static final String STORYTELLER_NAME = "이야기꾼";

    /** 작성자 + 참가자(각자 선택 캐릭터/진행자 여부) 저장. 작성자 자동 포함, 회원 중복 제거. 캐릭터명·역할군은 스냅샷. */
    private void saveParticipants(BgmAgitClockTowerRecord record, Long writerId, List<ClockTowerParticipantInput> inputs) {
        LinkedHashMap<Long, ClockTowerParticipantInput> memberToInput = new LinkedHashMap<>();
        if (writerId != null) {
            ClockTowerParticipantInput self = new ClockTowerParticipantInput();
            self.setMemberId(writerId);
            memberToInput.put(writerId, self);
        }
        if (inputs != null) {
            for (ClockTowerParticipantInput in : inputs) {
                if (in != null && in.getMemberId() != null) {
                    memberToInput.put(in.getMemberId(), in);
                }
            }
        }

        for (Map.Entry<Long, ClockTowerParticipantInput> e : memberToInput.entrySet()) {
            BgmAgitMember member = memberRepository.findById(e.getKey()).orElse(null);
            if (member == null) continue;

            ClockTowerParticipantInput in = e.getValue();
            String characterName = null;
            ClockTowerCharacterType characterType = null;
            if (in.isStoryteller()) {
                characterName = STORYTELLER_NAME;
            } else if (in.getCharacterId() != null) {
                BgmAgitClockTowerCharacter ch = characterRepository.findById(in.getCharacterId()).orElse(null);
                if (ch != null) {
                    characterName = ch.getName();
                    characterType = ch.getCharacterType();
                }
            }
            participantRepository.save(new BgmAgitClockTowerParticipant(record, member, characterName, characterType));
        }
    }

    /** 완료 저장은 결과 필수, 임시저장은 결과 비워도 허용(null). */
    private ClockTowerResult resolveResult(String result, boolean draft) {
        if (result == null || result.isBlank()) {
            if (draft) return null;
            throw new IllegalArgumentException("결과를 선택해주세요.");
        }
        return parseResult(result);
    }

    private ClockTowerResult parseResult(String result) {
        try {
            return ClockTowerResult.valueOf(result.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("결과 값이 올바르지 않습니다.");
        }
    }

    private boolean isAdmin(List<String> roles) {
        if (roles == null) return false;
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }

    /**
     * 시계탑 기록 수정·삭제는 자체로그인(MAHJONG) 회원만 가능.
     * 단, 관리자는 모더레이션을 위해 socialType 무관하게 허용한다.
     * 차단 시 403 ApiResponse 를 반환하고, 통과 시 null 을 반환한다.
     */
    private ApiResponse requireClockTowerWriter(Long memberId, List<String> roles) {
        if (isAdmin(roles)) return null;
        BgmAgitMember member = memberId != null ? memberRepository.findById(memberId).orElse(null) : null;
        if (member == null || member.getSocialType() != BgmAgitSocialType.MAHJONG) {
            return new ApiResponse(403, false, "자체로그인(마작) 회원만 시계탑 기록을 수정·삭제할 수 있습니다.");
        }
        return null;
    }

    private boolean canManage(BgmAgitClockTowerRecord record, Long memberId, List<String> roles) {
        if (isAdmin(roles)) return true;
        return memberId != null
                && record.getBgmAgitMember() != null
                && memberId.equals(record.getBgmAgitMember().getBgmAgitMemberId());
    }
}
