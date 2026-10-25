package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ClockTowerScriptParserTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("_meta 의 이름·작성자를 읽고, 문자열·객체 id 를 섞어 받는다")
    void metaAndMixedIds() {
        ClockTowerScriptParser.Parsed parsed = ClockTowerScriptParser.parse(objectMapper, """
                [{"id":"_meta","name":"Catfishing","author":"Emily"},"chef",{"id":"investigator"}]
                """);

        assertThat(parsed.name()).isEqualTo("Catfishing");
        assertThat(parsed.author()).isEqualTo("Emily");
        assertThat(parsed.entries()).extracting(ClockTowerScriptParser.Entry::key)
                .containsExactly("chef", "investigator");
        assertThat(parsed.entries()).allMatch(e -> e.homebrew() == null);
    }

    @Test
    @DisplayName("표기가 달라도 같은 캐릭터로 보고 중복은 한 번만 넣는다")
    void normalizeAndDedupe() {
        ClockTowerScriptParser.Parsed parsed = ClockTowerScriptParser.parse(objectMapper, """
                ["fortune_teller","Fortune Teller","fortuneteller","lil_monsta"]
                """);

        assertThat(parsed.name()).isNull();
        assertThat(parsed.entries()).extracting(ClockTowerScriptParser.Entry::key)
                .containsExactly("fortuneteller", "lilmonsta");
    }

    @Test
    @DisplayName("id 외 필드가 있는 객체는 자작 캐릭터 후보로 원본을 넘긴다")
    void homebrewObject() {
        ClockTowerScriptParser.Parsed parsed = ClockTowerScriptParser.parse(objectMapper, """
                [{"id":"my_hero","name":"영웅","team":"townsfolk","ability":"매일 밤 ..."}]
                """);

        ClockTowerScriptParser.Entry entry = parsed.entries().get(0);
        assertThat(entry.key()).isEqualTo("myhero");
        assertThat(entry.homebrew()).isNotNull();
        assertThat(entry.homebrew().path("team").asText()).isEqualTo("townsfolk");
    }

    @Test
    @DisplayName("배열이 아니거나 캐릭터가 없으면 거절한다")
    void reject() {
        assertThatThrownBy(() -> ClockTowerScriptParser.parse(objectMapper, "{\"id\":\"chef\"}"))
                .isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> ClockTowerScriptParser.parse(objectMapper, "[{\"id\":\"_meta\",\"name\":\"x\"}]"))
                .isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> ClockTowerScriptParser.parse(objectMapper, "not json"))
                .isInstanceOf(ValidException.class);
    }

    @Test
    @DisplayName("리마인더 번역 키 규칙과 같다")
    void normalizeKey() {
        assertThat(ClockTowerScriptParser.normalizeKey("3 Attacks")).isEqualTo("3attacks");
        assertThat(ClockTowerScriptParser.normalizeKey("Is The Drunk")).isEqualTo("isthedrunk");
        assertThat(ClockTowerScriptParser.normalizeKey(null)).isEmpty();
    }
}
