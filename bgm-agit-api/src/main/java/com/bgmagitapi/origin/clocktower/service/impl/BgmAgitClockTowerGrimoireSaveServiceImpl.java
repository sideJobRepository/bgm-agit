package com.bgmagitapi.origin.clocktower.service.impl;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGrimoireSaveRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGrimoireSaveResponse;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGrimoireSave;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerGameRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerGrimoireSaveRepository;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerGrimoireSaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitClockTowerGrimoireSaveServiceImpl implements BgmAgitClockTowerGrimoireSaveService {

    private final BgmAgitClockTowerGrimoireSaveRepository saveRepository;
    private final BgmAgitClockTowerGameRepository gameRepository;

    @Override
    public Long save(Long memberId, boolean admin, ClockTowerGrimoireSaveRequest request) {
        String state = request.getState() == null ? "" : request.getState().trim();
        // 화면이 그대로 다시 여는 JSON 객체만 받는다
        if (!state.startsWith("{")) {
            throw new ValidException("마도서 형식이 올바르지 않습니다.");
        }
        String title = StringUtils.hasText(request.getTitle()) ? request.getTitle().trim() : "이름 없는 마도서";
        if (request.getId() != null) {
            BgmAgitClockTowerGrimoireSave saved = loadOwned(request.getId(), memberId, admin);
            saved.overwrite(request.getGameId(), title, state);
            return saved.getId();
        }
        return saveRepository.save(new BgmAgitClockTowerGrimoireSave(memberId, request.getGameId(), title, state)).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClockTowerGrimoireSaveResponse> mine(Long memberId) {
        List<BgmAgitClockTowerGrimoireSave> rows = saveRepository.findByMemberIdOrderByModifyDateDesc(memberId);
        Map<Long, String> gameNames = gameRepository.findAllById(
                        rows.stream().map(BgmAgitClockTowerGrimoireSave::getGameId).filter(Objects::nonNull).distinct().toList())
                .stream()
                .collect(Collectors.toMap(BgmAgitClockTowerGame::getId, BgmAgitClockTowerGame::getName, (a, b) -> a));
        return rows.stream().map(s -> toResponse(s, gameNames, false)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClockTowerGrimoireSaveResponse get(Long id, Long memberId, boolean admin) {
        BgmAgitClockTowerGrimoireSave saved = loadOwned(id, memberId, admin);
        Map<Long, String> gameNames = saved.getGameId() == null
                ? Map.of()
                : gameRepository.findById(saved.getGameId())
                        .map(g -> Map.of(g.getId(), g.getName()))
                        .orElse(Map.of());
        return toResponse(saved, gameNames, true);
    }

    @Override
    public void delete(Long id, Long memberId, boolean admin) {
        saveRepository.delete(loadOwned(id, memberId, admin));
    }

    private BgmAgitClockTowerGrimoireSave loadOwned(Long id, Long memberId, boolean admin) {
        BgmAgitClockTowerGrimoireSave saved = saveRepository.findById(id)
                .orElseThrow(() -> new ValidException("저장된 마도서가 없습니다."));
        if (!admin && !Objects.equals(saved.getMemberId(), memberId)) {
            throw new ForbiddenException("저장한 이야기꾼만 열 수 있습니다.");
        }
        return saved;
    }

    private ClockTowerGrimoireSaveResponse toResponse(BgmAgitClockTowerGrimoireSave s, Map<Long, String> gameNames, boolean withState) {
        return ClockTowerGrimoireSaveResponse.builder()
                .id(s.getId())
                .gameId(s.getGameId())
                .gameName(s.getGameId() == null ? null : gameNames.get(s.getGameId()))
                .title(s.getTitle())
                .savedAt(s.getModifyDate() != null ? s.getModifyDate() : s.getRegistDate())
                .state(withState ? s.getState() : null)
                .build();
    }
}
