package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 공식 데이터(roles·nightsheet·jinxes + 공식 한국어 번역 ko.json)를 사전 행 모양으로 바꾼다. DB·HTTP 없이 순수 변환.
 * <ul>
 *   <li>roles.json: [{id, name, team, edition, ability, firstNightReminder, otherNightReminder, reminders[], remindersGlobal[], setup}]</li>
 *   <li>nightsheet.json: {firstNight:[id...], otherNight:[id...]} — 배열 순서가 곧 밤 순서. 캐릭터가 아닌 단계(dusk 등)도 섞여 있다</li>
 *   <li>jinxes.json: [{id, jinx:[{id, reason}]}]</li>
 *   <li>ko.json: {roles:{id:{name, ability, first, other}}, reminders:{정규화키:문구}, jinxes:{"a-b":문구}, editions:{tb:{name}}}</li>
 * </ul>
 * 번역이 빠진 항목은 영문을 그대로 쓴다.
 */
public final class ClockTowerOfficialData {

    /** 기본 3종 스크립트 판본 */
    public static final List<String> BASE_EDITIONS = List.of("tb", "bmr", "snv");

    public static final String NIGHT_EDITION = "night";

    /** 캐릭터가 아닌 밤 단계(황혼·하수인 정보·악마 정보·새벽) */
    public static final List<String> NIGHT_STEP_KEYS = List.of("dusk", "minioninfo", "demoninfo", "dawn");

    private static final Map<String, String> NIGHT_STEP_NAMES_EN = Map.of(
            "dusk", "Dusk",
            "minioninfo", "Minion Info",
            "demoninfo", "Demon Info",
            "dawn", "Dawn");

    private ClockTowerOfficialData() {
    }

    public record RoleData(String key,
                           String nameEn,
                           ClockTowerCharacterType team,
                           String edition,
                           Integer firstNightOrder,
                           Integer otherNightOrder,
                           boolean setup,
                           String name,
                           String ability,
                           String firstNightText,
                           String otherNightText,
                           List<String> reminders,
                           List<String> remindersGlobal) {
    }

    public record JinxData(String roleA, String roleB, String reason) {
    }

    public static List<RoleData> buildRoles(JsonNode roles, JsonNode nightsheet, JsonNode ko) {
        if (roles == null || !roles.isArray() || roles.isEmpty()) {
            throw new ValidException("공식 캐릭터 데이터 형식이 바뀌었습니다. 관리자에게 알려 주세요.");
        }
        Map<String, Integer> firstOrder = orderOf(nightsheet == null ? null : nightsheet.get("firstNight"));
        Map<String, Integer> otherOrder = orderOf(nightsheet == null ? null : nightsheet.get("otherNight"));
        JsonNode koRoles = ko == null ? null : ko.get("roles");
        JsonNode koReminders = ko == null ? null : ko.get("reminders");

        List<RoleData> result = new ArrayList<>();
        Set<String> roleKeys = new LinkedHashSet<>();
        for (JsonNode r : roles) {
            String key = r.path("id").asText("");
            ClockTowerCharacterType team = ClockTowerCharacterType.fromTeam(r.path("team").asText(null));
            if (key.isEmpty() || team == null || !roleKeys.add(key)) continue;
            JsonNode koRole = koRoles == null ? null : koRoles.get(key);
            result.add(new RoleData(
                    key,
                    text(r, "name"),
                    team,
                    text(r, "edition"),
                    firstOrder.get(key),
                    otherOrder.get(key),
                    r.path("setup").asBoolean(false),
                    firstNonBlank(text(koRole, "name"), text(r, "name")),
                    firstNonBlank(text(koRole, "ability"), text(r, "ability")),
                    firstNonBlank(text(koRole, "first"), text(r, "firstNightReminder")),
                    firstNonBlank(text(koRole, "other"), text(r, "otherNightReminder")),
                    translateReminders(r.get("reminders"), koReminders),
                    translateReminders(r.get("remindersGlobal"), koReminders)));
        }

        // 밤 특수 단계: 밤 순서에는 있는데 캐릭터가 아닌 것(황혼·하수인 정보·악마 정보·새벽)
        Set<String> stepKeys = new LinkedHashSet<>();
        stepKeys.addAll(firstOrder.keySet());
        stepKeys.addAll(otherOrder.keySet());
        stepKeys.removeAll(roleKeys);
        for (String key : stepKeys) {
            JsonNode koRole = koRoles == null ? null : koRoles.get(key);
            String nameEn = NIGHT_STEP_NAMES_EN.getOrDefault(key, key);
            result.add(new RoleData(key, nameEn, null, NIGHT_EDITION,
                    firstOrder.get(key), otherOrder.get(key), false,
                    firstNonBlank(text(koRole, "name"), nameEn),
                    null,
                    firstOrder.containsKey(key) ? text(koRole, "first") : null,
                    otherOrder.containsKey(key) ? text(koRole, "other") : null,
                    List.of(), List.of()));
        }
        return result;
    }

    public static List<JinxData> buildJinxes(JsonNode jinxes, JsonNode ko) {
        List<JinxData> result = new ArrayList<>();
        if (jinxes == null || !jinxes.isArray()) return result;
        JsonNode koJinxes = ko == null ? null : ko.get("jinxes");
        for (JsonNode host : jinxes) {
            String a = host.path("id").asText("");
            for (JsonNode j : host.path("jinx")) {
                String b = j.path("id").asText("");
                if (a.isEmpty() || b.isEmpty()) continue;
                // 공식 번역의 징크스 키는 두 id 를 알파벳순으로 정렬해 잇는다(주인-대상 순서가 아님)
                String koReason = koJinxes == null ? null : text(koJinxes, jinxKey(a, b));
                result.add(new JinxData(a, b, firstNonBlank(koReason, text(j, "reason"))));
            }
        }
        return result;
    }

    /** 공식 한국어 번역의 징크스 키: 두 캐릭터 id 를 알파벳순으로 정렬해 "-" 로 잇는다 */
    static String jinxKey(String a, String b) {
        return a.compareTo(b) <= 0 ? a + "-" + b : b + "-" + a;
    }

    /** 판본 한글 이름(흔들리는 혼돈 등). 없으면 영문 기본값 */
    public static String editionName(JsonNode ko, String edition) {
        JsonNode node = ko == null ? null : ko.path("editions").get(edition);
        String fallback = switch (edition) {
            case "tb" -> "Trouble Brewing";
            case "bmr" -> "Bad Moon Rising";
            case "snv" -> "Sects & Violets";
            default -> edition;
        };
        return firstNonBlank(text(node, "name"), fallback);
    }

    private static Map<String, Integer> orderOf(JsonNode ids) {
        Map<String, Integer> order = new HashMap<>();
        if (ids == null || !ids.isArray()) return order;
        int i = 1;
        for (JsonNode id : ids) {
            order.putIfAbsent(id.asText(), i++);
        }
        return order;
    }

    private static List<String> translateReminders(JsonNode reminders, JsonNode koReminders) {
        List<String> result = new ArrayList<>();
        if (reminders == null || !reminders.isArray()) return result;
        for (JsonNode r : reminders) {
            String en = r.asText();
            String ko = koReminders == null ? null : text(koReminders, ClockTowerScriptParser.normalizeKey(en));
            result.add(firstNonBlank(ko, en));
        }
        return result;
    }

    static String text(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        String s = v.asText().trim();
        return s.isEmpty() ? null : s;
    }

    private static String firstNonBlank(String a, String b) {
        return a != null ? a : b;
    }
}
