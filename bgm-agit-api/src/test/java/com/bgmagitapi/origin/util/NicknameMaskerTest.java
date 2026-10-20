package com.bgmagitapi.origin.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NicknameMaskerTest {

    @Test
    @DisplayName("2글자는 끝 글자, 3글자 이상은 가운데를 x 로 가린다")
    void maskByLength() {
        assertThat(NicknameMasker.mask("홍")).isEqualTo("홍");
        assertThat(NicknameMasker.mask("홍길")).isEqualTo("홍x");
        assertThat(NicknameMasker.mask("홍길동")).isEqualTo("홍x동");
        assertThat(NicknameMasker.mask("홍길동이")).isEqualTo("홍xx이");
        assertThat(NicknameMasker.mask("결제테스트")).isEqualTo("결xxx트");
        assertThat(NicknameMasker.mask("ab")).isEqualTo("ax");
    }

    @Test
    @DisplayName("비어 있으면 그대로, 앞뒤 공백은 떼고 센다")
    void blankAndSpaces() {
        assertThat(NicknameMasker.mask(null)).isNull();
        assertThat(NicknameMasker.mask("")).isEmpty();
        assertThat(NicknameMasker.mask(" 홍길동 ")).isEqualTo("홍x동");
    }
}
