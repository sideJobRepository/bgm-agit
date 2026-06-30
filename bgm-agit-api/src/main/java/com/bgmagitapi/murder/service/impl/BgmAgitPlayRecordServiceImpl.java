package com.bgmagitapi.murder.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.murder.dto.request.PlayRecordCreateRequest;
import com.bgmagitapi.murder.dto.request.PlayRecordModifyRequest;
import com.bgmagitapi.murder.dto.response.AllMemberResponse;
import com.bgmagitapi.murder.dto.response.ExperiencedMemberResponse;
import com.bgmagitapi.murder.dto.response.MemberHistoryResponse;
import com.bgmagitapi.murder.dto.response.MemberMonthlyBucketResponse;
import com.bgmagitapi.murder.dto.response.MemberPlayHistoryResponse;
import com.bgmagitapi.murder.dto.response.PlayRecordDetailResponse;
import com.bgmagitapi.murder.dto.response.PlayRecordListResponse;
import com.bgmagitapi.murder.dto.response.PlayRecordParticipantResponse;
import com.bgmagitapi.murder.entity.BgmAgitMurderGame;
import com.bgmagitapi.murder.entity.BgmAgitPlayRecord;
import com.bgmagitapi.murder.entity.BgmAgitPlayRecordParticipant;
import com.bgmagitapi.murder.repository.BgmAgitMurderGameRepository;
import com.bgmagitapi.murder.repository.BgmAgitPlayRecordParticipantRepository;
import com.bgmagitapi.murder.repository.BgmAgitPlayRecordRepository;
import com.bgmagitapi.murder.service.BgmAgitPlayRecordService;
import com.bgmagitapi.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitPlayRecordServiceImpl implements BgmAgitPlayRecordService {

    private final BgmAgitPlayRecordRepository playRecordRepository;
    private final BgmAgitPlayRecordParticipantRepository participantRepository;
    private final BgmAgitMurderGameRepository murderGameRepository;
    private final BgmAgitMemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PlayRecordListResponse> getPlayRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month) {
        Page<BgmAgitPlayRecord> page = playRecordRepository.findPlayRecords(pageable, gameId, memberId, year, month);

        List<Long> ids = page.getContent().stream().map(BgmAgitPlayRecord::getId).toList();
        Map<Long, List<String>> nicknamesByRecord = new LinkedHashMap<>();
        for (BgmAgitPlayRecordParticipant p : playRecordRepository.findParticipantsByRecordIds(ids)) {
            Long recordId = p.getPlayRecord().getId();
            String nickname = p.getBgmAgitMember() != null ? p.getBgmAgitMember().getBgmAgitMemberNickname() : null;
            nicknamesByRecord.computeIfAbsent(recordId, k -> new ArrayList<>()).add(nickname);
        }

        List<PlayRecordListResponse> content = new ArrayList<>();
        for (BgmAgitPlayRecord r : page.getContent()) {
            List<String> nicks = nicknamesByRecord.getOrDefault(r.getId(), List.of());
            content.add(PlayRecordListResponse.builder()
                    .id(r.getId())
                    .gameId(r.getMurderGame() != null ? r.getMurderGame().getId() : null)
                    .gameName(r.getMurderGame() != null ? r.getMurderGame().getName() : null)
                    .gameImageUrl(r.getMurderGame() != null ? r.getMurderGame().getImageUrl() : null)
                    .playDate(r.getPlayDate())
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
    public PlayRecordDetailResponse getPlayRecord(Long id, Long memberId, List<String> roles) {
        BgmAgitPlayRecord r = playRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));

        List<PlayRecordParticipantResponse> participants = playRecordRepository.findParticipantsByRecordIds(List.of(id))
                .stream()
                .map(PlayRecordParticipantResponse::from)
                .toList();

        BgmAgitMurderGame game = r.getMurderGame();
        return PlayRecordDetailResponse.builder()
                .id(r.getId())
                .gameId(game != null ? game.getId() : null)
                .gameName(game != null ? game.getName() : null)
                .gameImageUrl(game != null ? game.getImageUrl() : null)
                .gameMinPlayers(game != null ? game.getMinPlayers() : null)
                .gameMaxPlayers(game != null ? game.getMaxPlayers() : null)
                .playDate(r.getPlayDate())
                .writerId(r.getBgmAgitMember() != null ? r.getBgmAgitMember().getBgmAgitMemberId() : null)
                .writerNickname(r.getBgmAgitMember() != null ? r.getBgmAgitMember().getBgmAgitMemberNickname() : null)
                .memo(r.getMemo())
                .participants(participants)
                .canManage(canManage(r, memberId, roles))
                .build();
    }

    @Override
    public ApiResponse createPlayRecord(PlayRecordCreateRequest request, Long memberId) {
        BgmAgitMember writer = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        BgmAgitMurderGame game = murderGameRepository.findById(request.getGameId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));

        BgmAgitPlayRecord record = new BgmAgitPlayRecord(game, writer, request.getPlayDate(), request.getMemo());
        playRecordRepository.save(record);

        saveParticipants(record, memberId, request.getMemberIds());
        return new ApiResponse(200, true, "플레이 기록이 등록되었습니다.");
    }

    @Override
    public ApiResponse modifyPlayRecord(Long id, PlayRecordModifyRequest request, Long memberId, List<String> roles) {
        BgmAgitPlayRecord record = playRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));
        if (!canManage(record, memberId, roles)) {
            return new ApiResponse(403, false, "수정 권한이 없습니다.");
        }
        BgmAgitMurderGame game = murderGameRepository.findById(request.getGameId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));

        record.update(game, request.getPlayDate(), request.getMemo());

        // 참가자 전부 교체 (작성자는 강제 포함). 유니크 충돌 방지를 위해 삭제 flush 후 재삽입.
        participantRepository.deleteByPlayRecord_Id(id);
        participantRepository.flush();
        Long writerId = record.getBgmAgitMember() != null ? record.getBgmAgitMember().getBgmAgitMemberId() : memberId;
        saveParticipants(record, writerId, request.getMemberIds());
        return new ApiResponse(200, true, "플레이 기록이 수정되었습니다.");
    }

    @Override
    public ApiResponse deletePlayRecord(Long id, Long memberId, List<String> roles) {
        BgmAgitPlayRecord record = playRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기록입니다."));
        if (!canManage(record, memberId, roles)) {
            return new ApiResponse(403, false, "삭제 권한이 없습니다.");
        }
        participantRepository.deleteByPlayRecord_Id(id);
        participantRepository.flush();
        playRecordRepository.delete(record);
        return new ApiResponse(200, true, "플레이 기록이 삭제되었습니다.");
    }

    @Override
    @Transactional(readOnly = true)
    public MemberHistoryResponse getMemberHistory(Long memberId) {
        List<MemberPlayHistoryResponse> games = playRecordRepository.findMemberGameHistory(memberId);
        List<MemberMonthlyBucketResponse> monthly = playRecordRepository.findMemberMonthlyBuckets(memberId);

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        long thisMonth = playRecordRepository.countMemberSessions(memberId, monthStart, monthStart.plusMonths(1));
        long total = games.stream().mapToLong(g -> g.getPlayCount() != null ? g.getPlayCount() : 0L).sum();

        return MemberHistoryResponse.builder()
                .thisMonthCount(thisMonth)
                .totalCount(total)
                .games(games)
                .monthly(monthly)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AllMemberResponse> searchMembers(String keyword) {
        String kw = keyword == null ? "" : keyword.trim();
        // 자체로그인(MAHJONG) 회원만 노출. 소셜 가입(카카오/네이버) 등은 제외.
        List<BgmAgitSocialType> socialTypes = List.of(BgmAgitSocialType.MAHJONG);
        return memberRepository
                .searchMembersBySocialTypes(kw, socialTypes, PageRequest.of(0, 50))
                .stream()
                .map(AllMemberResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExperiencedMemberResponse> searchExperienced(Long gameId, List<Long> memberIds, Long excludeRecordId) {
        return playRecordRepository.findExperiencedMembers(gameId, memberIds, excludeRecordId);
    }

    // =========================== helpers ===========================

    // 작성자 + 참가자(memberIds) distinct 저장. 작성자는 항상 포함.
    private void saveParticipants(BgmAgitPlayRecord record, Long writerId, List<Long> memberIds) {
        LinkedHashSet<Long> ids = new LinkedHashSet<>();
        if (writerId != null) ids.add(writerId);
        if (memberIds != null) ids.addAll(memberIds);

        for (Long mid : ids) {
            if (mid == null) continue;
            BgmAgitMember member = memberRepository.findById(mid).orElse(null);
            if (member == null) continue;
            participantRepository.save(new BgmAgitPlayRecordParticipant(record, member));
        }
    }

    private boolean isAdmin(List<String> roles) {
        if (roles == null) return false;
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }

    private boolean canManage(BgmAgitPlayRecord record, Long memberId, List<String> roles) {
        if (isAdmin(roles)) return true;
        return memberId != null
                && record.getBgmAgitMember() != null
                && memberId.equals(record.getBgmAgitMember().getBgmAgitMemberId());
    }
}
