package com.bgmagitapi.origin.clocktower.service.impl;

import org.springframework.util.StringUtils;

import com.bgmagitapi.origin.advice.exception.ValidException;

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
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerRoleRepository;
import com.bgmagitapi.origin.clocktower.util.ClockTowerSessionRules;
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
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitClockTowerRecordServiceImpl implements BgmAgitClockTowerRecordService {

    private final BgmAgitClockTowerRecordRepository recordRepository;
    private final BgmAgitClockTowerParticipantRepository participantRepository;
    private final BgmAgitClockTowerGameRepository gameRepository;
    private final BgmAgitClockTowerCharacterRepository characterRepository;
    private final BgmAgitMemberRepository memberRepository;
    private final BgmAgitClockTowerRoleRepository roleRepository;

    // 캐릭터 이미지 끄기 스위치(BgmAgitClockTowerRoleServiceImpl 과 같은 설정)
    @org.springframework.beans.factory.annotation.Value("${clocktower.images-enabled:true}")
    private boolean imagesEnabled;

    @Override
    @Transactional(readOnly = true)
    public Page<ClockTowerRecordListResponse> getRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month,
                                                         Long viewerId, boolean isAdmin) {
        Page<BgmAgitClockTowerRecord> page = recordRepository.findRecords(pageable, gameId, memberId, year, month, viewerId, isAdmin);

        List<Long> ids = page.getContent().stream().map(BgmAgitClockTowerRecord::getId).toList();
        Map<Long, List<String>> nicknamesByRecord = new LinkedHashMap<>();
        Map<Long, List<BgmAgitClockTowerParticipant>> rowsByRecord = new LinkedHashMap<>();
        for (BgmAgitClockTowerParticipant p : recordRepository.findParticipantsByRecordIds(ids)) {
            Long recordId = p.getRecord().getId();
            String nickname = p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberNickname() : null;
            nicknamesByRecord.computeIfAbsent(recordId, k -> new ArrayList<>()).add(nickname);
            rowsByRecord.computeIfAbsent(recordId, k -> new ArrayList<>()).add(p);
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
                    .participants(rowsByRecord.getOrDefault(r.getId(), List.of()).stream()
                            .map(p -> ClockTowerParticipantResponse.from(p, r.getResult()))
                            .toList())
                    .build());
        }
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public ClockTowerRecordDetailResponse getRecord(Long id, Long memberId, List<String> roles) {
        BgmAgitClockTowerRecord r = recordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));

        List<BgmAgitClockTowerParticipant> rows = recordRepository.findParticipantsByRecordIds(List.of(id));
        Map<String, BgmAgitClockTowerRole> dict = participantRoles(r.getGame(), rows);
        List<ClockTowerParticipantResponse> participants = rows.stream()
                .map(p -> ClockTowerParticipantResponse.from(p, r.getResult(), participantImage(p, dict)))
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
                .hasGrimoire(StringUtils.hasText(r.getGrimoire()))
                .build();
    }

    /**
     * 참가자 캐릭터 그림용 사전. 참가자 행에는 캐릭터 이름만 있어 그 게임 캐릭터 목록에서 이름으로 사전 키를 찾는다.
     * 이름 → 사전 캐릭터. 그림 끄기면 빈 맵
     */
    private Map<String, BgmAgitClockTowerRole> participantRoles(BgmAgitClockTowerGame game, List<BgmAgitClockTowerParticipant> rows) {
        if (!imagesEnabled || game == null || rows.isEmpty()) return Map.of();
        Map<String, String> keyByName = characterRepository.findByGame_IdOrderByOrdersAsc(game.getId()).stream()
                .filter(c -> c.getName() != null && c.getRoleKey() != null)
                .collect(Collectors.toMap(BgmAgitClockTowerCharacter::getName, BgmAgitClockTowerCharacter::getRoleKey, (a, b) -> a));
        if (keyByName.isEmpty()) return Map.of();
        Map<String, BgmAgitClockTowerRole> byKey = roleRepository.findByRoleKeys(keyByName.values()).stream()
                .collect(Collectors.toMap(BgmAgitClockTowerRole::getRoleKey, x -> x, (a, b) -> a));
        Map<String, BgmAgitClockTowerRole> byName = new HashMap<>();
        keyByName.forEach((name, key) -> {
            BgmAgitClockTowerRole role = byKey.get(key);
            if (role != null) byName.put(name, role);
        });
        return byName;
    }

    /** 참가자의 실제 선악(진영이 바뀐 경우 포함)에 맞는 그림 */
    private String participantImage(BgmAgitClockTowerParticipant p, Map<String, BgmAgitClockTowerRole> dict) {
        BgmAgitClockTowerRole role = p.getCharacterName() == null ? null : dict.get(p.getCharacterName());
        if (role == null) return null;
        Boolean evil = ClockTowerSessionRules.displayEvil(p.resolveEvil(), p.getCharacterType());
        return ClockTowerSessionRules.pickImage(evil, role.getImageUrl(), role.getImageGoodUrl(), role.getImageEvilUrl());
    }

    @Override
    @Transactional(readOnly = true)
    public String getRecordGrimoire(Long id) {
        return recordRepository.findById(id)
                .map(BgmAgitClockTowerRecord::getGrimoire)
                .filter(StringUtils::hasText)
                .orElse(null);
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
        if (StringUtils.hasText(request.getGrimoire()) && request.getGrimoire().trim().startsWith("{")) {
            record.attachGrimoire(request.getGrimoire());
        }
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
            } else {
                BgmAgitClockTowerCharacter ch = resolveCharacter(record, in);
                if (ch != null) {
                    characterName = ch.getName();
                    characterType = ch.getCharacterType();
                }
            }
            Boolean evil = in.isStoryteller() ? null : in.getEvil();
            participantRepository.save(new BgmAgitClockTowerParticipant(record, member, characterName, characterType, evil));
        }
    }

    /**
     * 참가자 캐릭터 찾기. 이 게임 소속 characterId 가 우선이고, 없거나 다른 게임 것이면 (게임, roleKey) 로 다시 찾는다.
     * 게임 수정·공식 데이터 재가져오기는 캐릭터 행을 새로 만들어서, 진행판이 들고 있던 characterId 가 끊길 수 있다.
     * 둘 다 주었는데 못 찾으면 조용히 빈칸으로 두지 않고 400.
     */
    private BgmAgitClockTowerCharacter resolveCharacter(BgmAgitClockTowerRecord record, ClockTowerParticipantInput in) {
        Long gameId = record.getGame() != null ? record.getGame().getId() : null;
        if (in.getCharacterId() != null) {
            BgmAgitClockTowerCharacter ch = characterRepository.findById(in.getCharacterId()).orElse(null);
            if (ch != null && ch.getGame() != null && ch.getGame().getId().equals(gameId)) return ch;
        }
        if (StringUtils.hasText(in.getRoleKey()) && gameId != null) {
            return characterRepository.findInGameByRoleKey(gameId, in.getRoleKey().trim())
                    .orElseThrow(() -> new ValidException("이 게임에 없는 캐릭터가 있습니다(" + in.getRoleKey() + "). 스크립트가 바뀌었는지 확인해 주세요."));
        }
        if (in.getCharacterId() != null) {
            throw new ValidException("이 게임에 없는 캐릭터가 있습니다. 화면을 새로고침한 뒤 다시 골라 주세요.");
        }
        return null;
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
