package com.bgmagitapi.origin.clocktower.util;

import org.junit.jupiter.api.Test;

import static com.bgmagitapi.origin.clocktower.util.ClockTowerMemberMatcher.NO_MATCH;
import static com.bgmagitapi.origin.clocktower.util.ClockTowerMemberMatcher.rank;
import static org.assertj.core.api.Assertions.assertThat;

class ClockTowerMemberMatcherTest {

    @Test
    void 같은_닉네임이_가장_앞() {
        assertThat(rank("홍길동", "홍길동")).isEqualTo(0);
        assertThat(rank("Alice", "alice")).isEqualTo(0);
        assertThat(rank("홍 길동", "홍길동")).isEqualTo(0);
    }

    @Test
    void 앞부분과_중간() {
        assertThat(rank("홍길동", "홍길")).isEqualTo(1);
        assertThat(rank("김홍길", "홍길")).isEqualTo(2);
        assertThat(rank("홍길동", "박")).isEqualTo(NO_MATCH);
    }

    @Test
    void 초성으로_찾는다() {
        assertThat(rank("홍길동", "ㅎㄱㄷ")).isEqualTo(1);
        assertThat(rank("홍길동", "ㄱㄷ")).isEqualTo(2);
        assertThat(rank("홍길동", "홍ㄱㄷ")).isEqualTo(1);
        // 된소리는 따로 본다
        assertThat(rank("까치", "ㄱㅊ")).isEqualTo(NO_MATCH);
        assertThat(rank("까치", "ㄲㅊ")).isEqualTo(1);
    }

    @Test
    void 영문_숫자_섞인_닉네임() {
        assertThat(rank("민수123", "ㅁㅅ1")).isEqualTo(1);
        assertThat(rank("BGM민수", "ㅁㅅ")).isEqualTo(2);
    }

    @Test
    void 빈_검색어와_긴_검색어() {
        assertThat(rank("홍길동", " ")).isEqualTo(NO_MATCH);
        assertThat(rank("홍", "홍길동")).isEqualTo(NO_MATCH);
        assertThat(rank(null, "홍")).isEqualTo(NO_MATCH);
    }
}
