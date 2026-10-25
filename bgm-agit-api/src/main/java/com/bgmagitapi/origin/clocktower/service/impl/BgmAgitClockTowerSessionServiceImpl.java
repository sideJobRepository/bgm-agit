package com.bgmagitapi.origin.clocktower.service.impl;

import com.bgmagitapi.origin.advice.exception.ForbiddenException;
import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionSeatInput;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionSeatsRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerSessionViewedRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerMySeatResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerSessionStatusResponse;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerSession;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerSessionSeat;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerCharacterRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerGameRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerRoleRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerSessionRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerSessionSeatRepository;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerSessionService;
import com.bgmagitapi.origin.clocktower.util.ClockTowerSessionRules;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitClockTowerSessionServiceImpl implements BgmAgitClockTowerSessionService {

    private final BgmAgitClockTowerSessionRepository sessionRepository;
    private final BgmAgitClockTowerSessionSeatRepository seatRepository;
    private final BgmAgitClockTowerGameRepository gameRepository;
    private final BgmAgitClockTowerCharacterRepository characterRepository;
    private final BgmAgitClockTowerRoleRepository roleRepository;
    private final BgmAgitMemberRepository memberRepository;
    private final ObjectMapper objectMapper;

    // 캐릭터 이미지 끄기 스위치(BgmAgitClockTowerRoleServiceImpl 과 같은 설정)
    @Value("${clocktower.images-enabled:true}")
    private boolean imagesEnabled;

    // =========================== 이야기꾼 ===========================

    @Override
    public Long createSession(Long storytellerId, ClockTowerSessionCreateRequest request) {
        if (request == null || request.getGameId() == null) {
            throw new ValidException("게임을 선택해 주세요.");
        }
        BgmAgitClockTowerGame game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new ValidException("존재하지 않는 게임입니다."));
        List<NormalizedSeat> seats = normalizeSeats(request.getSeats(), false);
        requireMembersExist(seats.stream().map(NormalizedSeat::memberId).collect(Collectors.toSet()));
        validateRoleKeys(seats, GameCatalog.of(characterRepository.findByGame_IdOrderByOrdersAsc(game.getId())));

        LocalDateTime now = LocalDateTime.now();
        sessionRepository.closeActiveByStoryteller(storytellerId, now);
        BgmAgitClockTowerSession session = sessionRepository.save(new BgmAgitClockTowerSession(game.getId(), storytellerId));
        for (NormalizedSeat s : seats) {
            seatRepository.save(new BgmAgitClockTowerSessionSeat(
                    session.getId(), s.memberId(), s.seatNo(), s.roleKey(), s.evil(), s.info()));
        }
        return session.getId();
    }

    @Override
    public int updateSeats(Long sessionId, Long memberId, boolean admin, ClockTowerSessionSeatsRequest request) {
        BgmAgitClockTowerSession session = loadOwnedSession(sessionId, memberId, admin);
        if (!isOpen(session, LocalDateTime.now())) {
            throw new ValidException("이미 끝난 게임입니다. 새로 시작해 주세요.");
        }
        List<NormalizedSeat> seats = normalizeSeats(request == null ? null : request.getSeats(), true);
        if (seats.isEmpty()) return 0;

        Map<Long, BgmAgitClockTowerSessionSeat> existing = sessionRepository.findSeats(sessionId).stream()
                .collect(Collectors.toMap(BgmAgitClockTowerSessionSeat::getMemberId, Function.identity(), (a, b) -> a));
        Set<Long> newMembers = seats.stream()
                .map(NormalizedSeat::memberId)
                .filter(id -> !existing.containsKey(id))
                .collect(Collectors.toSet());
        requireMembersExist(newMembers);
        validateRoleKeys(seats, GameCatalog.of(characterRepository.findByGame_IdOrderByOrdersAsc(session.getGameId())));

        int updated = 0;
        for (NormalizedSeat s : seats) {
            BgmAgitClockTowerSessionSeat seat = existing.get(s.memberId());
            if (seat == null) {
                seatRepository.save(new BgmAgitClockTowerSessionSeat(
                        sessionId, s.memberId(), s.seatNo(), s.roleKey(), s.evil(), s.info()));
                updated++;
            } else if (seat.apply(s.seatNo(), s.roleKey(), s.evil(), s.info())) {
                updated++;
            }
        }
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public ClockTowerSessionStatusResponse getStatus(Long sessionId, Long memberId, boolean admin) {
        BgmAgitClockTowerSession session = loadOwnedSession(sessionId, memberId, admin);
        List<ClockTowerSessionStatusResponse.Seat> seats = sessionRepository.findSeats(sessionId).stream()
                .map(s -> ClockTowerSessionStatusResponse.Seat.builder()
                        .memberId(s.getMemberId())
                        .seatNo(s.getSeatNo())
                        .version(s.getVersion())
                        .viewedVersion(s.getViewedVersion())
                        .viewedAt(formatTime(s.getViewedAt()))
                        .build())
                .toList();
        return ClockTowerSessionStatusResponse.builder()
                .sessionId(session.getId())
                .status(isOpen(session, LocalDateTime.now()) ? BgmAgitClockTowerSession.ACTIVE : BgmAgitClockTowerSession.CLOSED)
                .seats(seats)
                .build();
    }

    @Override
    public void closeSession(Long sessionId, Long memberId, boolean admin) {
        loadOwnedSession(sessionId, memberId, admin).close();
    }

    // =========================== 플레이어 ===========================

    @Override
    @Transactional(readOnly = true)
    public ClockTowerMySeatResponse getMySeat(Long memberId) {
        LocalDateTime now = LocalDateTime.now();
        BgmAgitClockTowerSessionSeat seat = sessionRepository
                .findLatestActiveSeat(memberId, ClockTowerSessionRules.aliveCreatedAfter(now))
                .orElse(null);
        if (seat == null) {
            return ClockTowerMySeatResponse.builder().active(false).build();
        }
        BgmAgitClockTowerSession session = sessionRepository.findById(seat.getSessionId()).orElse(null);
        if (session == null || !isOpen(session, now)) {
            return ClockTowerMySeatResponse.builder().active(false).build();
        }
        String gameName = gameRepository.findById(session.getGameId())
                .map(BgmAgitClockTowerGame::getName)
                .orElse(null);
        Boolean evil = ClockTowerSessionRules.parseEvil(seat.getEvil());

        return ClockTowerMySeatResponse.builder()
                .active(true)
                .sessionId(session.getId())
                .gameId(session.getGameId())
                .gameName(gameName)
                .seatNo(seat.getSeatNo())
                .version(seat.getVersion())
                .viewedVersion(seat.getViewedVersion())
                .role(resolveRole(session.getGameId(), seat.getRoleKey(), evil))
                .evil(evil)
                .info(readInfo(seat.getInfo()))
                .build();
    }

    @Override
    public void markViewed(Long memberId, ClockTowerSessionViewedRequest request) {
        if (request == null || request.getSessionId() == null || request.getVersion() == null) {
            throw new ValidException("확인할 게임 정보가 없습니다.");
        }
        BgmAgitClockTowerSessionSeat seat = sessionRepository.findSeat(request.getSessionId(), memberId)
                .orElseThrow(() -> new ValidException("이 게임에 앉은 자리가 없습니다."));
        seat.markViewed(request.getVersion(), LocalDateTime.now());
    }

    // =========================== helpers ===========================

    private BgmAgitClockTowerSession loadOwnedSession(Long sessionId, Long memberId, boolean admin) {
        BgmAgitClockTowerSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ValidException("존재하지 않는 게임 진행입니다."));
        if (!admin && !Objects.equals(session.getStorytellerMemberId(), memberId)) {
            throw new ForbiddenException("이 게임의 이야기꾼만 사용할 수 있습니다.");
        }
        return session;
    }

    private boolean isOpen(BgmAgitClockTowerSession session, LocalDateTime now) {
        return session.isActive() && !ClockTowerSessionRules.isExpired(session.getRegistDate(), now);
    }

    private void requireMembersExist(Set<Long> memberIds) {
        if (memberIds.isEmpty()) return;
        if (memberRepository.findAllById(memberIds).size() != memberIds.size()) {
            throw new ValidException("존재하지 않는 회원이 있습니다.");
        }
    }

    private List<NormalizedSeat> normalizeSeats(List<ClockTowerSessionSeatInput> inputs, boolean allowEmpty) {
        List<ClockTowerSessionSeatInput> list = inputs == null ? List.of() : inputs;
        if (list.stream().anyMatch(Objects::isNull)) {
            throw new ValidException("비어 있는 좌석이 있습니다.");
        }
        ClockTowerSessionRules.validateSeats(
                list.stream().map(i -> new ClockTowerSessionRules.SeatKey(i.getMemberId(), i.getSeatNo())).toList(),
                allowEmpty);
        return list.stream()
                .map(i -> new NormalizedSeat(
                        i.getMemberId(),
                        i.getSeatNo(),
                        ClockTowerSessionRules.normalizeRoleKey(i.getRoleKey()),
                        ClockTowerSessionRules.evilFlag(i.getEvil()),
                        writeInfo(i.getInfo())))
                .toList();
    }

    /** 이 게임의 캐릭터만 받는다. 사전 키는 그 게임 캐릭터 행의 roleKey 목록에, "c{id}" 는 그 게임 캐릭터 행에 있어야 한다 */
    private void validateRoleKeys(List<NormalizedSeat> seats, GameCatalog catalog) {
        for (NormalizedSeat s : seats) {
            String key = s.roleKey();
            if (key == null) continue;
            Long characterId = ClockTowerSessionRules.characterIdOf(key);
            boolean ok = characterId != null ? catalog.byId().containsKey(characterId) : catalog.byKey().containsKey(key);
            if (!ok) {
                throw new ValidException("이 게임에 없는 캐릭터입니다: " + key);
            }
        }
    }

    /** 이름·진영·능력은 게임 캐릭터 행(사전과 동기화됨), 이미지는 사전에서. 클라이언트가 보낸 이름은 쓰지 않는다 */
    private ClockTowerMySeatResponse.Role resolveRole(Long gameId, String roleKey, Boolean evil) {
        if (roleKey == null) return null;
        Long characterId = ClockTowerSessionRules.characterIdOf(roleKey);
        if (characterId != null) {
            BgmAgitClockTowerCharacter c = characterRepository.findById(characterId)
                    .filter(ch -> ch.getGame() != null && Objects.equals(ch.getGame().getId(), gameId))
                    .orElse(null);
            if (c == null) return null;
            return buildRole(roleKey, c.getName(), c.getCharacterType(), c.getDescription(), null);
        }

        BgmAgitClockTowerCharacter c = characterRepository.findInGameByRoleKey(gameId, roleKey).orElse(null);
        BgmAgitClockTowerRole r = roleRepository.findByRoleKeys(List.of(roleKey)).stream().findFirst().orElse(null);
        if (c == null && r == null) return null;

        String name = c != null ? c.getName() : r.getName();
        ClockTowerCharacterType type = c != null ? c.getCharacterType() : r.getTeam();
        String ability = c != null ? c.getDescription() : r.getAbility();
        String image = null;
        if (imagesEnabled && r != null) {
            image = ClockTowerSessionRules.pickImage(ClockTowerSessionRules.displayEvil(evil, type),
                    r.getImageUrl(), r.getImageGoodUrl(), r.getImageEvilUrl());
        }
        return buildRole(roleKey, name, type, ability, image);
    }

    private ClockTowerMySeatResponse.Role buildRole(String key, String name, ClockTowerCharacterType type,
                                                    String ability, String image) {
        return ClockTowerMySeatResponse.Role.builder()
                .key(key)
                .name(name)
                .team(type != null ? type.name() : null)
                .teamName(type != null ? type.getValue() : null)
                .ability(ability)
                .image(image)
                .build();
    }

    private String writeInfo(ClockTowerSessionSeatInput.Info info) {
        if (info == null) return null;
        ClockTowerSessionRules.Info normalized = ClockTowerSessionRules.normalizeInfo(info.getTitle(), info.getLines());
        if (normalized == null) return null;
        try {
            return objectMapper.writeValueAsString(normalized);
        } catch (JsonProcessingException e) {
            throw new ValidException("정보를 저장할 수 없습니다.");
        }
    }

    private ClockTowerMySeatResponse.Info readInfo(String json) {
        if (!StringUtils.hasText(json)) return null;
        try {
            ClockTowerSessionRules.Info info = objectMapper.readValue(json, ClockTowerSessionRules.Info.class);
            return ClockTowerMySeatResponse.Info.builder()
                    .title(info.title() == null ? "" : info.title())
                    .lines(info.lines() == null ? List.of() : info.lines())
                    .build();
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private static String formatTime(LocalDateTime t) {
        return t == null ? null : t.truncatedTo(ChronoUnit.SECONDS).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    private record NormalizedSeat(Long memberId, Integer seatNo, String roleKey, String evil, String info) {
    }

    /** 게임 캐릭터 행: id 로, 사전 키로 */
    private record GameCatalog(Map<Long, BgmAgitClockTowerCharacter> byId, Map<String, BgmAgitClockTowerCharacter> byKey) {
        static GameCatalog of(List<BgmAgitClockTowerCharacter> characters) {
            Map<Long, BgmAgitClockTowerCharacter> byId = new HashMap<>();
            Map<String, BgmAgitClockTowerCharacter> byKey = new HashMap<>();
            Set<String> seen = new HashSet<>();
            for (BgmAgitClockTowerCharacter c : characters) {
                byId.put(c.getId(), c);
                if (StringUtils.hasText(c.getRoleKey()) && seen.add(c.getRoleKey())) {
                    byKey.put(c.getRoleKey(), c);
                }
            }
            return new GameCatalog(byId, byKey);
        }
    }
}
