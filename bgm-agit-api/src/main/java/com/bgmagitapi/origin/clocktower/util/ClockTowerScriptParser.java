package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * 커스텀 스크립트 JSON 해석. 공식 스크립트 도구·커뮤니티가 쓰는 형식을 받는다.
 * <pre>
 * [ {"id":"_meta","name":"스크립트명","author":"작성자"}, "chef", {"id":"fortune_teller"}, {자작 캐릭터 전체 객체}, ... ]
 * </pre>
 * 캐릭터 id 는 커뮤니티마다 표기가 달라(fortune_teller / Fortune Teller / fortuneteller) 정규화해서 비교한다.
 * 공식 id 는 이미 영소문자·숫자만이라 정규화해도 그대로다.
 */
public final class ClockTowerScriptParser {

    private static final String META_ID = "_meta";

    private ClockTowerScriptParser() {
    }

    /** @param homebrew id 만 온 항목이면 null, 객체로 온 항목이면 그 객체(공식인지 자작인지는 사전과 대조해 정한다) */
    public record Entry(String key, JsonNode homebrew) {
    }

    public record Parsed(String name, String author, List<Entry> entries) {
    }

    public static Parsed parse(ObjectMapper objectMapper, String json) {
        JsonNode root;
        try {
            root = objectMapper.readTree(json == null ? "" : json.trim());
        } catch (Exception e) {
            throw new ValidException("스크립트 JSON 형식이 올바르지 않습니다.");
        }
        if (root == null || !root.isArray()) {
            throw new ValidException("스크립트 JSON 은 [ ... ] 배열이어야 합니다.");
        }

        String name = null;
        String author = null;
        Set<String> seen = new LinkedHashSet<>();
        List<Entry> entries = new ArrayList<>();
        for (JsonNode item : root) {
            String rawId;
            JsonNode object = null;
            if (item.isTextual()) {
                rawId = item.asText();
            } else if (item.isObject()) {
                rawId = item.path("id").asText("");
                if (META_ID.equals(rawId)) {
                    name = textOrNull(item, "name");
                    author = textOrNull(item, "author");
                    continue;
                }
                object = item.size() > 1 ? item : null;
            } else {
                continue;
            }
            String key = normalizeKey(rawId);
            if (key.isEmpty() || !seen.add(key)) continue;
            entries.add(new Entry(key, object));
        }
        if (entries.isEmpty()) {
            throw new ValidException("스크립트에 캐릭터가 없습니다.");
        }
        return new Parsed(name, author, entries);
    }

    /** 영소문자·숫자만 남긴다. 공식 리마인더 한국어 번역 키도 같은 규칙이다("3 Attacks" → "3attacks") */
    public static String normalizeKey(String raw) {
        if (raw == null) return "";
        return raw.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        String s = v.asText().trim();
        return s.isEmpty() ? null : s;
    }
}
