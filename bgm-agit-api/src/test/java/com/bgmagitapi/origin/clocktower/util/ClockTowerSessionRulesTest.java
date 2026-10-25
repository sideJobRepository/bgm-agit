package com.bgmagitapi.origin.clocktower.util;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.clocktower.util.ClockTowerSessionRules.SeatKey;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ClockTowerSessionRulesTest {

    private static final LocalDateTime T0 = LocalDateTime.of(2026, 11, 1, 19, 0);

    @Test
    void 생성_후_18시간이_지나면_만료() {
        assertThat(ClockTowerSessionRules.isExpired(T0, T0.plusHours(17).plusMinutes(59))).isFalse();
        assertThat(ClockTowerSessionRules.isExpired(T0, T0.plusHours(18))).isTrue();
        assertThat(ClockTowerSessionRules.isExpired(T0, T0.plusDays(2))).isTrue();
        assertThat(ClockTowerSessionRules.isExpired(null, T0)).isTrue();
        assertThat(ClockTowerSessionRules.aliveCreatedAfter(T0)).isEqualTo(T0.minusHours(18));
    }

    @Test
    void 바뀐_좌석_판정() {
        assertThat(ClockTowerSessionRules.isChanged(1, "imp", null, null, 1, "imp", null, null)).isFalse();
        assertThat(ClockTowerSessionRules.isChanged(1, "imp", null, "{}", 1, "imp", null, "{}")).isFalse();
        assertThat(ClockTowerSessionRules.isChanged(1, "imp", null, null, 2, "imp", null, null)).isTrue();
        assertThat(ClockTowerSessionRules.isChanged(1, "imp", null, null, 1, "washerwoman", null, null)).isTrue();
        assertThat(ClockTowerSessionRules.isChanged(1, "imp", null, null, 1, "imp", "N", null)).isTrue();
        assertThat(ClockTowerSessionRules.isChanged(1, "imp", null, null, 1, "imp", null, "{\"title\":\"a\"}")).isTrue();
        assertThat(ClockTowerSessionRules.isChanged(1, null, null, null, 1, "imp", null, null)).isTrue();
    }

    @Test
    void 확인_버전은_지금_버전을_넘지_않고_뒤로_가지_않는다() {
        assertThat(ClockTowerSessionRules.nextViewedVersion(0, 3, 3)).isEqualTo(3);
        assertThat(ClockTowerSessionRules.nextViewedVersion(0, 99, 3)).isEqualTo(3);
        assertThat(ClockTowerSessionRules.nextViewedVersion(3, 1, 4)).isEqualTo(3);
        assertThat(ClockTowerSessionRules.nextViewedVersion(null, -5, 2)).isEqualTo(0);
    }

    @Test
    void 직접_입력_캐릭터_키() {
        assertThat(ClockTowerSessionRules.characterIdOf("c123")).isEqualTo(123L);
        assertThat(ClockTowerSessionRules.characterIdOf("chef")).isNull();
        assertThat(ClockTowerSessionRules.characterIdOf("c")).isNull();
        assertThat(ClockTowerSessionRules.characterIdOf("c12a")).isNull();
        assertThat(ClockTowerSessionRules.characterIdOf("g3:c12")).isNull();
        assertThat(ClockTowerSessionRules.characterIdOf(null)).isNull();
    }

    @Test
    void 선악_플래그() {
        assertThat(ClockTowerSessionRules.evilFlag(true)).isEqualTo("Y");
        assertThat(ClockTowerSessionRules.evilFlag(false)).isEqualTo("N");
        assertThat(ClockTowerSessionRules.evilFlag(null)).isNull();
        assertThat(ClockTowerSessionRules.parseEvil("Y")).isTrue();
        assertThat(ClockTowerSessionRules.parseEvil("N")).isFalse();
        assertThat(ClockTowerSessionRules.parseEvil(null)).isNull();
    }

    @Test
    void 보여줄_선악은_지정값_우선_없으면_기본_진영() {
        assertThat(ClockTowerSessionRules.displayEvil(null, ClockTowerCharacterType.DEMON)).isTrue();
        assertThat(ClockTowerSessionRules.displayEvil(null, ClockTowerCharacterType.TOWNSFOLK)).isFalse();
        assertThat(ClockTowerSessionRules.displayEvil(true, ClockTowerCharacterType.TOWNSFOLK)).isTrue();
        assertThat(ClockTowerSessionRules.displayEvil(null, ClockTowerCharacterType.TRAVELLER)).isNull();
        assertThat(ClockTowerSessionRules.displayEvil(false, ClockTowerCharacterType.TRAVELLER)).isFalse();
        assertThat(ClockTowerSessionRules.displayEvil(null, ClockTowerCharacterType.FABLED)).isNull();
        assertThat(ClockTowerSessionRules.displayEvil(null, null)).isNull();
    }

    @Test
    void 진영에_맞는_이미지() {
        assertThat(ClockTowerSessionRules.pickImage(true, null, "g.webp", "e.webp")).isEqualTo("e.webp");
        assertThat(ClockTowerSessionRules.pickImage(false, null, "g.webp", "e.webp")).isEqualTo("g.webp");
        // 여행자: 진영 없음 → 무진영
        assertThat(ClockTowerSessionRules.pickImage(null, "p.webp", "g.webp", "e.webp")).isEqualTo("p.webp");
        // 자작 캐릭터처럼 한 장만 있으면 그걸 쓴다
        assertThat(ClockTowerSessionRules.pickImage(true, "p.webp", null, null)).isEqualTo("p.webp");
        // 복사 전이면 null
        assertThat(ClockTowerSessionRules.pickImage(true, null, "g.webp", null)).isNull();
        assertThat(ClockTowerSessionRules.pickImage(null, null, null, null)).isNull();
    }

    @Test
    void 정보_카드_정리() {
        ClockTowerSessionRules.Info info = ClockTowerSessionRules.normalizeInfo("  첫날 밤 ", Arrays.asList(" A ", "", null, "B"));
        assertThat(info.title()).isEqualTo("첫날 밤");
        assertThat(info.lines()).containsExactly("A", "B");
        assertThat(ClockTowerSessionRules.normalizeInfo(" ", List.of(" "))).isNull();
        assertThat(ClockTowerSessionRules.normalizeInfo(null, List.of("x")).title()).isEqualTo("");

        List<String> tooMany = new ArrayList<>();
        for (int i = 0; i <= ClockTowerSessionRules.MAX_INFO_LINES; i++) tooMany.add("줄" + i);
        assertThatThrownBy(() -> ClockTowerSessionRules.normalizeInfo("t", tooMany)).isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> ClockTowerSessionRules.normalizeInfo("t", List.of("x".repeat(501))))
                .isInstanceOf(ValidException.class);
    }

    @Test
    void 좌석_검사() {
        ClockTowerSessionRules.validateSeats(List.of(new SeatKey(1L, 1), new SeatKey(2L, 2)), false);
        ClockTowerSessionRules.validateSeats(List.of(), true);
        assertThatThrownBy(() -> ClockTowerSessionRules.validateSeats(List.of(), false)).isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> ClockTowerSessionRules.validateSeats(
                List.of(new SeatKey(1L, 1), new SeatKey(1L, 2)), false)).isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> ClockTowerSessionRules.validateSeats(
                List.of(new SeatKey(null, 1)), false)).isInstanceOf(ValidException.class);
        assertThatThrownBy(() -> ClockTowerSessionRules.validateSeats(
                List.of(new SeatKey(1L, 0)), false)).isInstanceOf(ValidException.class);
    }

    @Test
    void 캐릭터_키_정리() {
        assertThat(ClockTowerSessionRules.normalizeRoleKey("  imp ")).isEqualTo("imp");
        assertThat(ClockTowerSessionRules.normalizeRoleKey(" ")).isNull();
        assertThatThrownBy(() -> ClockTowerSessionRules.normalizeRoleKey("a".repeat(101)))
                .isInstanceOf(ValidException.class);
    }
}
