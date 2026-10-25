package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class ClockTowerOfficialDataTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private JsonNode json(String s) throws Exception {
        return objectMapper.readTree(s);
    }

    @Test
    @DisplayName("밤 순서·한국어 번역을 붙이고, 번역이 없으면 영문을 쓴다")
    void buildRoles() throws Exception {
        JsonNode roles = json("""
                [{"id":"poisoner","name":"Poisoner","team":"minion","edition":"tb","ability":"Each night...",
                  "firstNightReminder":"The Poisoner chooses.","otherNightReminder":"The Poisoner chooses.",
                  "reminders":["Poisoned"],"setup":false},
                 {"id":"baron","name":"Baron","team":"minion","edition":"tb","ability":"There are extra Outsiders.",
                  "reminders":[],"setup":true},
                 {"id":"thief","name":"Thief","team":"traveller","edition":"tb","ability":"x","reminders":["X"]}]
                """);
        JsonNode nightsheet = json("""
                {"firstNight":["dusk","minioninfo","poisoner","dawn"],"otherNight":["dusk","poisoner","dawn"]}
                """);
        JsonNode ko = json("""
                {"roles":{"poisoner":{"name":"독살범","ability":"매일 밤...","first":"독살범이 고릅니다.","other":"독살범이 고릅니다."},
                          "dusk":{"name":"황혼","first":"밤 단계를 시작합니다.","other":"밤 단계를 시작합니다."}},
                 "reminders":{"poisoned":"중독됨"}}
                """);

        Map<String, ClockTowerOfficialData.RoleData> byKey = ClockTowerOfficialData.buildRoles(roles, nightsheet, ko)
                .stream().collect(Collectors.toMap(ClockTowerOfficialData.RoleData::key, Function.identity()));

        ClockTowerOfficialData.RoleData poisoner = byKey.get("poisoner");
        assertThat(poisoner.name()).isEqualTo("독살범");
        assertThat(poisoner.team()).isEqualTo(ClockTowerCharacterType.MINION);
        assertThat(poisoner.firstNightOrder()).isEqualTo(3);
        assertThat(poisoner.otherNightOrder()).isEqualTo(2);
        assertThat(poisoner.reminders()).containsExactly("중독됨");

        ClockTowerOfficialData.RoleData baron = byKey.get("baron");
        assertThat(baron.name()).isEqualTo("Baron");
        assertThat(baron.setup()).isTrue();
        assertThat(baron.firstNightOrder()).isNull();

        assertThat(byKey.get("thief").team()).isEqualTo(ClockTowerCharacterType.TRAVELLER);
        assertThat(byKey.get("thief").reminders()).containsExactly("X");

        // 캐릭터가 아닌 밤 단계도 들어간다(진영 없음)
        ClockTowerOfficialData.RoleData dusk = byKey.get("dusk");
        assertThat(dusk.team()).isNull();
        assertThat(dusk.edition()).isEqualTo(ClockTowerOfficialData.NIGHT_EDITION);
        assertThat(dusk.name()).isEqualTo("황혼");
        assertThat(dusk.firstNightOrder()).isEqualTo(1);
        assertThat(byKey.get("minioninfo").name()).isEqualTo("Minion Info");
        assertThat(byKey.get("minioninfo").otherNightOrder()).isNull();
    }

    @Test
    @DisplayName("징크스는 \"a-b\" 키로 한국어를 찾는다")
    void buildJinxes() throws Exception {
        JsonNode jinxes = json("""
                [{"id":"alchemist","jinx":[{"id":"boffin","reason":"en reason"},{"id":"marionette","reason":"en2"}]}]
                """);
        JsonNode ko = json("""
                {"jinxes":{"alchemist-boffin":"한국어 사유"}}
                """);

        List<ClockTowerOfficialData.JinxData> result = ClockTowerOfficialData.buildJinxes(jinxes, ko);

        assertThat(result).containsExactly(
                new ClockTowerOfficialData.JinxData("alchemist", "boffin", "한국어 사유"),
                new ClockTowerOfficialData.JinxData("alchemist", "marionette", "en2"));
    }

    @Test
    @DisplayName("징크스 번역 키는 주인-대상 순서가 아니라 알파벳 정렬이다")
    void jinxKeySorted() throws Exception {
        JsonNode jinxes = json("""
                [{"id":"mathematician","jinx":[{"id":"drunk","reason":"en"}]}]
                """);
        JsonNode ko = json("""
                {"jinxes":{"drunk-mathematician":"한국어"}}
                """);

        assertThat(ClockTowerOfficialData.buildJinxes(jinxes, ko))
                .containsExactly(new ClockTowerOfficialData.JinxData("mathematician", "drunk", "한국어"));
    }

    @Test
    @DisplayName("판본 이름은 번역, 없으면 영문")
    void editionName() throws Exception {
        JsonNode ko = json("""
                {"editions":{"tb":{"name":"흔들리는 혼돈"}}}
                """);
        assertThat(ClockTowerOfficialData.editionName(ko, "tb")).isEqualTo("흔들리는 혼돈");
        assertThat(ClockTowerOfficialData.editionName(ko, "bmr")).isEqualTo("Bad Moon Rising");
    }
}
