package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 캐릭터 토큰 이미지 경로 규칙. DB·HTTP 없이 순수 계산.
 * <ul>
 *   <li>원본: {@code https://release.botc.app/resources/characters/{edition}/{id}[_g|_e].webp}</li>
 *   <li>우리 S3: {@code clocktower/characters/} 뒤에 같은 경로(판본 폴더 = roles.json 의 edition)</li>
 *   <li>주민·외지인·하수인·악마는 선(_g)·악(_e) 두 장, 여행자는 무진영 + 선 + 악 세 장, 전설·로릭은 무진영 한 장</li>
 *   <li>진영 기본 이미지는 generic 폴더 22장(이미지 없는 자작 캐릭터·실패 시 대체용)</li>
 * </ul>
 */
public final class ClockTowerImagePaths {

    /** 원본 호스트는 고정한다(요청에서 받은 문자열로 주소를 만들지 않는다 — SSRF 방지) */
    public static final String SOURCE_BASE = "https://release.botc.app/resources/characters/";
    public static final String S3_PREFIX = "clocktower/characters/";
    public static final String GENERIC_EDITION = "generic";

    /** 공식 generic 폴더 파일(확장자 제외). 접미사 없는 이름이 기본(2026-06 추가) */
    public static final List<String> GENERIC_NAMES = List.of(
            "custom", "custom_g", "custom_e",
            "townsfolk", "townsfolk_g", "townsfolk_e",
            "outsider", "outsider_g", "outsider_e",
            "minion", "minion_g", "minion_e",
            "demon", "demon_g", "demon_e",
            "traveller", "traveller_g", "traveller_e",
            "fabled", "loric", "good", "evil");

    /** 복사 요청 경로 형식. 화이트리스트 검사 전 1차 거름 */
    private static final Pattern PATH = Pattern.compile("^([a-z]+)/([a-z0-9]+?)(_[ge])?\\.webp$");

    /** 자작 캐릭터 이미지 주소 상한(DB 컬럼 varchar(500)) */
    public static final int MAX_EXTERNAL_URL = 500;

    private ClockTowerImagePaths() {
    }

    /** 이미지 한 장의 갈래: 무진영 / 선 / 악 */
    public enum Variant {
        PLAIN(""), GOOD("_g"), EVIL("_e");

        private final String suffix;

        Variant(String suffix) {
            this.suffix = suffix;
        }

        public String suffix() {
            return suffix;
        }

        static Variant ofSuffix(String suffix) {
            if ("_g".equals(suffix)) return GOOD;
            if ("_e".equals(suffix)) return EVIL;
            return PLAIN;
        }
    }

    /** 경로를 쪼갠 결과. generic 이면 name 이 접미사까지 포함한 파일 이름이다 */
    public record Parsed(String edition, String id, Variant variant) {
        public boolean isGeneric() {
            return GENERIC_EDITION.equals(edition);
        }
    }

    /** 형식에 맞지 않으면 null */
    public static Parsed parse(String path) {
        if (path == null) return null;
        Matcher m = PATH.matcher(path);
        if (!m.matches()) return null;
        String edition = m.group(1);
        String id = m.group(2);
        Variant variant = Variant.ofSuffix(m.group(3));
        if (GENERIC_EDITION.equals(edition)) {
            // generic 은 접미사까지 파일 이름이다(townsfolk_e)
            return new Parsed(edition, id + variant.suffix(), Variant.PLAIN);
        }
        return new Parsed(edition, id, variant);
    }

    /** 공식 캐릭터 한 명이 가져야 할 이미지 갈래. 이미지가 없는 진영(밤 특수 단계)은 빈 목록 */
    public static List<Variant> variantsOf(ClockTowerCharacterType team) {
        if (team == null) return List.of();
        return switch (team) {
            case TOWNSFOLK, OUTSIDER, MINION, DEMON -> List.of(Variant.GOOD, Variant.EVIL);
            case TRAVELLER -> List.of(Variant.PLAIN, Variant.GOOD, Variant.EVIL);
            case FABLED, LORIC -> List.of(Variant.PLAIN);
        };
    }

    public static String path(String edition, String id, Variant variant) {
        return edition + "/" + id + variant.suffix() + ".webp";
    }

    public static String genericPath(String name) {
        return GENERIC_EDITION + "/" + name + ".webp";
    }

    public static String sourceUrl(String path) {
        return SOURCE_BASE + path;
    }

    public static String s3Key(String path) {
        return S3_PREFIX + path;
    }

    /** 공식 판본 폴더인지(밤 특수 단계 night·자작 homebrew 는 원본 이미지가 없다) */
    public static boolean isOfficialEdition(String edition) {
        return edition != null && edition.matches("[a-z]+")
                && !ClockTowerOfficialData.NIGHT_EDITION.equals(edition)
                && !"homebrew".equals(edition)
                && !GENERIC_EDITION.equals(edition);
    }

    /**
     * 자작 캐릭터 이미지 주소 검사. 복제하지 않고 원본 주소를 그대로 쓰므로 화면에 박혀도 안전한 것만 남긴다.
     * http(s)만, 500자 이하, svg 거부(스크립트를 품을 수 있다). 맞지 않으면 null
     */
    public static String safeExternalUrl(String raw) {
        if (raw == null) return null;
        String url = raw.trim();
        if (url.isEmpty() || url.length() > MAX_EXTERNAL_URL) return null;
        URI uri;
        try {
            uri = URI.create(url);
        } catch (IllegalArgumentException e) {
            return null;
        }
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (!scheme.equals("http") && !scheme.equals("https")) return null;
        if (uri.getHost() == null || uri.getHost().isBlank()) return null;
        String p = uri.getPath() == null ? "" : uri.getPath().toLowerCase(Locale.ROOT);
        if (p.endsWith(".svg") || p.endsWith(".svgz")) return null;
        return url;
    }

    /** 자작 캐릭터 image 필드 해석 결과 */
    public record HomebrewImages(String image, String good, String evil) {
    }

    /**
     * 스크립트 JSON 자작 캐릭터의 image(문자열 또는 배열)를 갈래별로 나눈다.
     * 배열 순서는 [기본 진영, 뒤집힌 진영], 여행자는 [무진영, 선, 악](스크립트 스키마 image 설명).
     * 주민·외지인의 기본 진영은 선, 하수인·악마는 악이다.
     */
    public static HomebrewImages homebrewImages(JsonNode imageNode, ClockTowerCharacterType team) {
        if (imageNode == null || imageNode.isNull() || imageNode.isMissingNode()) {
            return new HomebrewImages(null, null, null);
        }
        List<String> urls = new ArrayList<>();
        if (imageNode.isArray()) {
            for (JsonNode n : imageNode) urls.add(safeExternalUrl(n.asText(null)));
        } else {
            urls.add(safeExternalUrl(imageNode.asText(null)));
        }
        String first = urls.isEmpty() ? null : urls.get(0);
        String second = urls.size() > 1 ? urls.get(1) : null;
        if (team == null) return new HomebrewImages(first, null, null);
        return switch (team) {
            case TOWNSFOLK, OUTSIDER -> new HomebrewImages(first, first, second);
            case MINION, DEMON -> new HomebrewImages(first, second, first);
            case TRAVELLER -> new HomebrewImages(first, second, urls.size() > 2 ? urls.get(2) : null);
            case FABLED, LORIC -> new HomebrewImages(first, null, null);
        };
    }
}
