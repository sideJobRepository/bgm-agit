package com.bgmagitapi.origin.murder.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MurderLogCoverSearcherTest {

    @Test
    void 시리즈명이_붙은_이름은_부제부터_찾는다() {
        assertThat(MurderLogCoverSearcher.queries("미스터리 파티 시리즈 : 마녀는 황혼의 종에 사라진다"))
                .containsSubsequence("미스터리 파티 시리즈 : 마녀는 황혼의 종에 사라진다", "마녀는 황혼의 종에 사라진다", "미스터리 파티 시리즈");
        assertThat(MurderLogCoverSearcher.queries("Mystery&adventure box 01. 분가")).contains("분가");
        assertThat(MurderLogCoverSearcher.queries("코멕스 기가스 1. 성스러운 십자가")).contains("성스러운 십자가");
        assertThat(MurderLogCoverSearcher.queries("초능력 학원 머더파일-꿈을 조작하는 자")).contains("꿈을 조작하는 자");
    }

    @Test
    void 표기가_달라도_앞_두_단어로_한_번_더_찾는다() {
        // 머미로그 제목은 "라이노 교수가 아는 다가올 오늘 중의 죽음"
        assertThat(MurderLogCoverSearcher.queries("라이노 교수가 아는 다가올 오늘의 죽음")).endsWith("라이노 교수가");
    }

    @Test
    void 짧은_영문_조각은_검색어로_쓰지_않는다() {
        // "up" 으로 찾으면 엉뚱한 게임 10개가 나온다
        assertThat(MurderLogCoverSearcher.queries("이스터에그 ver.4 Level-up")).doesNotContain("up");
    }

    @Test
    void 짧은_이름은_그대로_한_번만() {
        assertThat(MurderLogCoverSearcher.queries("격리")).containsExactly("격리");
    }
}
