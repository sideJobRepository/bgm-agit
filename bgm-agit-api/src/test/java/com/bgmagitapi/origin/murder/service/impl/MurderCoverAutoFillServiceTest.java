package com.bgmagitapi.origin.murder.service.impl;

import com.bgmagitapi.origin.murder.util.BoardlifeCoverSearcher.CoverCandidate;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

// 예시는 운영 게임명을 보드라이프에 실제로 검색한 결과(2026-10-12)
class MurderCoverAutoFillServiceTest {

    private static CoverCandidate c(String title) {
        return new CoverCandidate(title, "https://img/" + title.hashCode() + "_w100.jpg", "https://img/" + title.hashCode() + ".jpg", "");
    }

    @Test
    void 이름이_정확히_같으면_고른다_띄어쓰기_문장부호는_무시() {
        assertThat(MurderCoverAutoFillService.pickSameGame("Y의 장례식", List.of(c("Y의 장례식")))).isNotNull();
        assertThat(MurderCoverAutoFillService.pickSameGame("머더미스터리미니 별장살인", List.of(c("머더 미스터리 미니: 별장 살인")))).isNotNull();
    }

    @Test
    void 짧은_이름이라_후보가_많으면_정확히_같아도_건너뛴다() {
        List<CoverCandidate> tower = IntStream.range(0, 30).mapToObj(i -> c(i == 7 ? "타워" : "타워 디펜스 " + i)).toList();
        assertThat(MurderCoverAutoFillService.pickSameGame("타워", tower)).isNull();
    }

    @Test
    void 시리즈명이_앞에_붙은_단일_후보는_고른다() {
        assertThat(MurderCoverAutoFillService.pickSameGame("시체와 온천", List.of(c("머더 미스터리 미니: 시체와 온천")))).isNotNull();
        assertThat(MurderCoverAutoFillService.pickSameGame("웬디 어른이 되렴", List.of(c("머더 미스터리 미니: 웬디, 어른이 되렴")))).isNotNull();
    }

    @Test
    void 이름이_중간에만_들어간_후보는_고르지_않는다() {
        assertThat(MurderCoverAutoFillService.pickSameGame("별의 추락", List.of(c("룬바운드 (3판): 검은별의 추락 - 시나리오 팩")))).isNull();
        assertThat(MurderCoverAutoFillService.pickSameGame("초초", List.of(c("크툴루 워즈: 초초 확장")))).isNull();
        assertThat(MurderCoverAutoFillService.pickSameGame("0719", List.of(c("0719: 낙하를 향하는 두개의 수")))).isNull();
    }

    @Test
    void 같은_이름이_여러_개면_건너뛴다() {
        assertThat(MurderCoverAutoFillService.pickSameGame("알리바이", List.of(c("알리바이"), c("알리바이")))).isNull();
    }
}
