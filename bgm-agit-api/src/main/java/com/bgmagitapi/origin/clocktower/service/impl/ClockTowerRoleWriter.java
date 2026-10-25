package com.bgmagitapi.origin.clocktower.service.impl;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerImportResponse;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerJinx;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerCharacterRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerGameRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerJinxRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerRoleRepository;
import com.bgmagitapi.origin.clocktower.util.ClockTowerImagePaths;
import com.bgmagitapi.origin.clocktower.util.ClockTowerOfficialData;
import com.bgmagitapi.origin.clocktower.util.ClockTowerOfficialData.JinxData;
import com.bgmagitapi.origin.clocktower.util.ClockTowerOfficialData.RoleData;
import com.bgmagitapi.origin.clocktower.util.ClockTowerOfficialDataClient;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 받아온 공식 데이터를 한 트랜잭션으로 반영한다.
 * 외부 호출은 {@link BgmAgitClockTowerRoleServiceImpl#importOfficial()} 가 트랜잭션 밖에서 끝낸 뒤 이걸 부른다.
 * 변환(파싱)이 전부 성공한 뒤에만 쓰므로, 공식 데이터 형식이 바뀌어 실패해도 기존 사전은 그대로다.
 */
@Component
@RequiredArgsConstructor
public class ClockTowerRoleWriter {

    /** 기본 스크립트 권장 인원(공식 규칙 5~15인, 여행자 제외) */
    private static final int BASE_MIN_PLAYERS = 5;
    private static final int BASE_MAX_PLAYERS = 15;
    private static final String TPI = "The Pandemonium Institute";

    private final BgmAgitClockTowerRoleRepository roleRepository;
    private final BgmAgitClockTowerJinxRepository jinxRepository;
    private final BgmAgitClockTowerGameRepository gameRepository;
    private final BgmAgitClockTowerCharacterRepository characterRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public ClockTowerImportResponse apply(ClockTowerOfficialDataClient.Bundle bundle) {
        List<RoleData> roles = ClockTowerOfficialData.buildRoles(bundle.roles(), bundle.nightsheet(), bundle.ko());
        List<JinxData> jinxes = ClockTowerOfficialData.buildJinxes(bundle.jinxes(), bundle.ko());

        Map<String, BgmAgitClockTowerRole> existing = roleRepository.findOfficialRoles().stream()
                .collect(Collectors.toMap(BgmAgitClockTowerRole::getRoleKey, Function.identity(), (a, b) -> a));

        int added = 0;
        int keptEdited = 0;
        Map<String, BgmAgitClockTowerRole> current = new HashMap<>();
        for (RoleData rd : roles) {
            BgmAgitClockTowerRole role = existing.get(rd.key());
            if (role == null) {
                role = roleRepository.save(new BgmAgitClockTowerRole(rd.key(), null));
                added++;
            } else if (role.isCustomEdited()) {
                keptEdited++;
            }
            role.applyOfficial(rd.nameEn(), rd.team(), rd.edition(), rd.firstNightOrder(), rd.otherNightOrder(),
                    rd.setup(), rd.name(), rd.ability(), rd.firstNightText(), rd.otherNightText(),
                    toJson(rd.reminders()), toJson(rd.remindersGlobal()));
            current.put(rd.key(), role);
            if (rd.team() != null) {
                roleRepository.syncCharacters(rd.key(), role.getName(), role.getTeam(), role.getAbility());
            }
        }

        Map<String, BgmAgitClockTowerJinx> existingJinx = jinxRepository.findAll().stream()
                .collect(Collectors.toMap(j -> j.getRoleA() + "|" + j.getRoleB(), Function.identity(), (a, b) -> a));
        for (JinxData jd : jinxes) {
            BgmAgitClockTowerJinx jinx = existingJinx.get(jd.roleA() + "|" + jd.roleB());
            if (jinx == null) {
                jinxRepository.save(new BgmAgitClockTowerJinx(jd.roleA(), jd.roleB(), jd.reason()));
            } else {
                jinx.changeReason(jd.reason());
            }
        }

        List<String> scripts = new ArrayList<>();
        for (String edition : ClockTowerOfficialData.BASE_EDITIONS) {
            List<RoleData> members = roles.stream()
                    .filter(r -> edition.equals(r.edition()) && r.team() != null && r.team().isSeatable())
                    .sorted(Comparator.comparing(RoleData::team))
                    .toList();
            if (members.isEmpty()) continue;
            String name = ClockTowerOfficialData.editionName(bundle.ko(), edition);
            BgmAgitClockTowerGame game = gameRepository.findByScriptKey(edition)
                    .orElseGet(() -> gameRepository.save(BgmAgitClockTowerGame.ofScript(
                            name, "OFFICIAL", edition, TPI, BASE_MIN_PLAYERS, BASE_MAX_PLAYERS)));
            // 캐릭터 행 재구성(참가자는 이름·역할군 스냅샷이라 과거 기록은 그대로)
            characterRepository.deleteByGame_Id(game.getId());
            int order = 0;
            for (RoleData rd : members) {
                BgmAgitClockTowerRole role = current.get(rd.key());
                characterRepository.save(new BgmAgitClockTowerCharacter(
                        game, role.getName(), role.getTeam(), role.getAbility(), order++, rd.key()));
            }
            scripts.add(game.getName());
        }

        int total = (int) roles.stream().filter(r -> r.team() != null).count();
        int updated = roles.size() - added;
        return new ClockTowerImportResponse(total, added, updated, keptEdited, jinxes.size(), scripts);
    }

    /** 스크립트 JSON 의 자작 캐릭터 반영(그 스크립트 전용) */
    public BgmAgitClockTowerRole saveHomebrew(Long gameId, String key, ClockTowerCharacterType team,
                                              JsonNode node) {
        BgmAgitClockTowerRole role = roleRepository.save(new BgmAgitClockTowerRole("g" + gameId + ":" + key, gameId));
        String name = text(node, "name", key);
        // 자작 캐릭터의 밤 순서 값은 옛 공식 번호 체계라 우리 순서와 맞지 않는다. 깨우는 캐릭터면 맨 뒤에 둔다
        Integer first = node.path("firstNight").asDouble(0) > 0 ? 999 : null;
        Integer other = node.path("otherNight").asDouble(0) > 0 ? 999 : null;
        role.applyOfficial(name, team, "homebrew", first, other, node.path("setup").asBoolean(false),
                name, text(node, "ability", null),
                text(node, "firstNightReminder", null), text(node, "otherNightReminder", null),
                reminderJson(node.get("reminders")), reminderJson(node.get("remindersGlobal")));
        // 자작 이미지는 복제하지 않고 원본 주소를 그대로 쓴다(http(s)·500자·svg 거부 검사만)
        ClockTowerImagePaths.HomebrewImages images = ClockTowerImagePaths.homebrewImages(node.get("image"), team);
        role.applyHomebrewImages(images.image(), images.good(), images.evil());
        return role;
    }

    /** S3 에 복사한 공식 이미지 한 장을 사전 행에 반영(이미지 복사가 파일마다 짧게 부른다) */
    @Transactional
    public void markImageSynced(String roleKey, ClockTowerImagePaths.Variant variant, String url) {
        roleRepository.findByRoleKeys(List.of(roleKey)).stream()
                .filter(r -> r.getGameId() == null)
                .findFirst()
                .ifPresent(r -> r.applySyncedImage(variant, url, LocalDateTime.now()));
    }

    // 리마인더 컬럼은 varchar(1000). 커뮤니티 자작 캐릭터가 길게 넣으면 스크립트 등록 전체가 DB 오류로 실패하므로 넘치는 항목은 버린다
    private static final int REMINDERS_MAX = 1000;

    private String reminderJson(JsonNode node) {
        List<String> values = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode n : node) {
                String v = n.asText("").trim();
                if (!v.isEmpty()) values.add(v);
            }
        }
        while (!values.isEmpty() && toJson(values).length() > REMINDERS_MAX) {
            values.remove(values.size() - 1);
        }
        return toJson(values);
    }

    private static String text(JsonNode node, String field, String fallback) {
        String v = node.path(field).asText("").trim();
        return v.isEmpty() ? fallback : v;
    }

    private String toJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (Exception e) {
            throw new ValidException("리마인더 변환에 실패했습니다.");
        }
    }
}
