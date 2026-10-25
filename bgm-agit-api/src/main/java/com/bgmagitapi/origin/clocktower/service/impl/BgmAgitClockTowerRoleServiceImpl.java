package com.bgmagitapi.origin.clocktower.service.impl;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRoleModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerScriptCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGrimoireResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerImportResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRoleResponse;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerCharacterRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerGameRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerJinxRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerRoleRepository;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerRoleService;
import com.bgmagitapi.origin.clocktower.util.ClockTowerImagePaths;
import com.bgmagitapi.origin.clocktower.util.ClockTowerOfficialData;
import com.bgmagitapi.origin.clocktower.util.ClockTowerOfficialDataClient;
import com.bgmagitapi.origin.clocktower.util.ClockTowerScriptParser;
import com.bgmagitapi.origin.config.S3FileUtils;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitClockTowerRoleServiceImpl implements BgmAgitClockTowerRoleService {

    // 사전에 없다고 돌려줄 id 를 몇 개까지 보여줄지
    private static final int UNKNOWN_PREVIEW = 10;

    private final ClockTowerOfficialDataClient officialDataClient;
    private final ClockTowerRoleWriter roleWriter;
    private final BgmAgitClockTowerRoleRepository roleRepository;
    private final BgmAgitClockTowerGameRepository gameRepository;
    private final BgmAgitClockTowerCharacterRepository characterRepository;
    private final BgmAgitClockTowerJinxRepository jinxRepository;
    private final ObjectMapper objectMapper;
    private final S3FileUtils s3FileUtils;

    // 캐릭터 이미지 끄기 스위치(권리자 요청 등). 끄면 진행판 응답에서 이미지 주소를 빼 글자 토큰으로 돌아간다
    @Value("${clocktower.images-enabled:true}")
    private boolean imagesEnabled;

    // 외부 호출(수 초) 동안 DB 트랜잭션을 잡지 않는다. 받은 뒤 쓰기만 writer 의 트랜잭션에서
    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public ClockTowerImportResponse importOfficial() {
        ClockTowerOfficialDataClient.Bundle bundle = officialDataClient.fetch();
        return roleWriter.apply(bundle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClockTowerRoleResponse> getRoles(String team, String keyword) {
        ClockTowerCharacterType teamType = StringUtils.hasText(team) ? ClockTowerCharacterType.fromTeam(team) : null;
        return roleRepository.searchOfficialRoles(teamType, keyword).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ApiResponse modifyRole(Long id, ClockTowerRoleModifyRequest request) {
        BgmAgitClockTowerRole role = roleRepository.findById(id)
                .orElseThrow(() -> new ValidException("존재하지 않는 캐릭터입니다."));
        role.editText(request.getName().trim(), trimToNull(request.getAbility()),
                trimToNull(request.getFirstNightText()), trimToNull(request.getOtherNightText()));
        if (role.getTeam() != null) {
            roleRepository.syncCharacters(role.getRoleKey(), role.getName(), role.getTeam(), role.getAbility());
        }
        return new ApiResponse(200, true, "수정되었습니다. 공식 데이터를 다시 가져와도 이 문구는 유지됩니다.");
    }

    @Override
    public ApiResponse resetRole(Long id) {
        BgmAgitClockTowerRole role = roleRepository.findById(id)
                .orElseThrow(() -> new ValidException("존재하지 않는 캐릭터입니다."));
        role.clearCustomEdited();
        return new ApiResponse(200, true, "다음 공식 데이터 가져오기 때 공식 문구로 돌아갑니다.");
    }

    @Override
    public ApiResponse createScript(ClockTowerScriptCreateRequest request) {
        ClockTowerScriptParser.Parsed parsed = ClockTowerScriptParser.parse(objectMapper, request.getJson());
        String name = StringUtils.hasText(request.getName()) ? request.getName().trim() : parsed.name();
        if (!StringUtils.hasText(name)) {
            throw new ValidException("스크립트 이름을 입력해 주세요. (JSON 에 이름이 없습니다)");
        }
        Integer min = request.getMinPlayers();
        Integer max = request.getMaxPlayers();
        if (min != null && max != null && min > max) {
            throw new ValidException("최소 인원이 최대 인원보다 클 수 없습니다.");
        }

        List<String> keys = parsed.entries().stream().map(ClockTowerScriptParser.Entry::key).toList();
        Map<String, BgmAgitClockTowerRole> official = roleRepository.findByRoleKeys(keys).stream()
                .filter(r -> r.getGameId() == null && r.getTeam() != null)
                .collect(Collectors.toMap(BgmAgitClockTowerRole::getRoleKey, Function.identity(), (a, b) -> a));
        if (official.isEmpty() && roleRepository.findOfficialRoles().isEmpty()) {
            throw new ValidException("캐릭터 사전이 비어 있습니다. 먼저 공식 데이터를 가져와 주세요.");
        }

        List<String> unknown = new ArrayList<>();
        for (ClockTowerScriptParser.Entry e : parsed.entries()) {
            if (official.containsKey(e.key())) continue;
            if (homebrewTeam(e) != null) continue;
            unknown.add(e.key());
        }
        if (!unknown.isEmpty()) {
            String preview = String.join(", ", unknown.subList(0, Math.min(UNKNOWN_PREVIEW, unknown.size())));
            String more = unknown.size() > UNKNOWN_PREVIEW ? " 외 " + (unknown.size() - UNKNOWN_PREVIEW) + "개" : "";
            throw new ValidException("캐릭터 사전에 없는 캐릭터가 있습니다: " + preview + more
                    + ". 공식 데이터를 다시 가져오거나 JSON 을 확인해 주세요.");
        }

        BgmAgitClockTowerGame game = gameRepository.save(
                BgmAgitClockTowerGame.ofScript(name, "CUSTOM", null, parsed.author(), min, max));

        List<BgmAgitClockTowerRole> members = new ArrayList<>();
        for (ClockTowerScriptParser.Entry e : parsed.entries()) {
            BgmAgitClockTowerRole role = official.get(e.key());
            members.add(role != null ? role : roleWriter.saveHomebrew(game.getId(), e.key(), homebrewTeam(e), e.homebrew()));
        }
        members.sort(Comparator.comparing(BgmAgitClockTowerRole::getTeam));
        int order = 0;
        for (BgmAgitClockTowerRole role : members) {
            characterRepository.save(new BgmAgitClockTowerCharacter(
                    game, role.getName(), role.getTeam(), role.getAbility(), order++, role.getRoleKey()));
        }
        return new ApiResponse(200, true, "스크립트가 등록되었습니다. (캐릭터 " + members.size() + "개)");
    }

    @Override
    @Transactional(readOnly = true)
    public ClockTowerGrimoireResponse getGrimoire(Long gameId) {
        BgmAgitClockTowerGame game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ValidException("존재하지 않는 게임입니다."));
        List<BgmAgitClockTowerCharacter> characters = characterRepository.findByGame_IdOrderByOrdersAsc(gameId);

        List<String> keys = characters.stream()
                .map(BgmAgitClockTowerCharacter::getRoleKey)
                .filter(StringUtils::hasText)
                .toList();
        List<String> lookup = new ArrayList<>(keys);
        lookup.addAll(ClockTowerOfficialData.NIGHT_STEP_KEYS);
        Map<String, BgmAgitClockTowerRole> dict = roleRepository.findByRoleKeys(lookup).stream()
                .collect(Collectors.toMap(BgmAgitClockTowerRole::getRoleKey, Function.identity(), (a, b) -> a));

        List<ClockTowerGrimoireResponse.Role> roles = new ArrayList<>();
        for (BgmAgitClockTowerCharacter c : characters) {
            BgmAgitClockTowerRole r = c.getRoleKey() == null ? null : dict.get(c.getRoleKey());
            ClockTowerCharacterType type = c.getCharacterType();
            roles.add(ClockTowerGrimoireResponse.Role.builder()
                    .key(r != null ? r.getRoleKey() : "c" + c.getId())
                    .characterId(c.getId())
                    .name(c.getName())
                    .team(type != null ? type.name() : null)
                    .ability(c.getDescription())
                    .firstNightOrder(r != null ? r.getFirstNightOrder() : null)
                    .otherNightOrder(r != null ? r.getOtherNightOrder() : null)
                    .firstNightText(r != null ? r.getFirstNightText() : null)
                    .otherNightText(r != null ? r.getOtherNightText() : null)
                    .reminders(r != null ? readList(r.getReminders()) : List.of())
                    .remindersGlobal(r != null ? readList(r.getRemindersGlobal()) : List.of())
                    .setup(r != null && "Y".equals(r.getSetup()))
                    .image(imagesEnabled && r != null ? r.getImageUrl() : null)
                    .imageGood(imagesEnabled && r != null ? r.getImageGoodUrl() : null)
                    .imageEvil(imagesEnabled && r != null ? r.getImageEvilUrl() : null)
                    .build());
        }

        List<ClockTowerGrimoireResponse.Role> nightSteps = ClockTowerOfficialData.NIGHT_STEP_KEYS.stream()
                .map(dict::get)
                .filter(Objects::nonNull)
                .map(r -> ClockTowerGrimoireResponse.Role.builder()
                        .key(r.getRoleKey())
                        .name(r.getName())
                        .firstNightOrder(r.getFirstNightOrder())
                        .otherNightOrder(r.getOtherNightOrder())
                        .firstNightText(r.getFirstNightText())
                        .otherNightText(r.getOtherNightText())
                        .reminders(List.of())
                        .remindersGlobal(List.of())
                        .build())
                .toList();

        List<ClockTowerGrimoireResponse.Jinx> jinxes = jinxRepository.findAmong(keys).stream()
                .map(j -> new ClockTowerGrimoireResponse.Jinx(j.getRoleA(), j.getRoleB(), j.getReason()))
                .toList();

        return ClockTowerGrimoireResponse.builder()
                .gameId(game.getId())
                .gameName(game.getName())
                .roles(roles)
                .nightSteps(nightSteps)
                .jinxes(jinxes)
                .genericImages(genericImages())
                .build();
    }

    // =========================== helpers ===========================

    // 키가 정해져 있어 주소만 만든다(있는지 확인하면 조회마다 S3 를 22번 부른다). 아직 복사 전이면 화면이 글자 토큰으로 대체한다
    private Map<String, String> genericImages() {
        if (!imagesEnabled) return Map.of();
        Map<String, String> result = new LinkedHashMap<>();
        for (String name : ClockTowerImagePaths.GENERIC_NAMES) {
            result.put(name, s3FileUtils.urlOf(ClockTowerImagePaths.s3Key(ClockTowerImagePaths.genericPath(name))));
        }
        return result;
    }

    private ClockTowerCharacterType homebrewTeam(ClockTowerScriptParser.Entry e) {
        return e.homebrew() == null ? null : ClockTowerCharacterType.fromTeam(e.homebrew().path("team").asText(null));
    }

    private ClockTowerRoleResponse toResponse(BgmAgitClockTowerRole r) {
        return ClockTowerRoleResponse.builder()
                .id(r.getId())
                .roleKey(r.getRoleKey())
                .name(r.getName())
                .nameEn(r.getNameEn())
                .team(r.getTeam() != null ? r.getTeam().name() : null)
                .teamName(r.getTeam() != null ? r.getTeam().getValue() : null)
                .edition(r.getEdition())
                .ability(r.getAbility())
                .firstNightOrder(r.getFirstNightOrder())
                .otherNightOrder(r.getOtherNightOrder())
                .firstNightText(r.getFirstNightText())
                .otherNightText(r.getOtherNightText())
                .reminders(readList(r.getReminders()))
                .remindersGlobal(readList(r.getRemindersGlobal()))
                .setup("Y".equals(r.getSetup()))
                .customEdited(r.isCustomEdited())
                .image(imagesEnabled ? r.getImageUrl() : null)
                .imageGood(imagesEnabled ? r.getImageGoodUrl() : null)
                .imageEvil(imagesEnabled ? r.getImageEvilUrl() : null)
                .build();
    }

    private List<String> readList(String json) {
        if (!StringUtils.hasText(json)) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private static String trimToNull(String s) {
        return StringUtils.hasText(s) ? s.trim() : null;
    }
}
