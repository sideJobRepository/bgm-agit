package com.bgmagitapi.origin.murder.service.impl;

import com.bgmagitapi.origin.murder.util.MurderLogCoverSearcher.CoverCandidate;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

// 예시는 표지 없던 게임명을 머미로그에 실제로 검색한 결과(2026-10-12)
class MurderCoverAutoFillServiceTest {

    private static CoverCandidate c(String title) {
        String url = "https://img/" + title.hashCode() + ".webp";
        return new CoverCandidate(title, url, url, "", null, null, null);
    }

    @Test
    void 이름이_정확히_같으면_고른다_띄어쓰기_문장부호는_무시() {
        assertThat(MurderCoverAutoFillService.pickSameGame("Y의 장례식", List.of(c("Y의 장례식")))).isNotNull();
        assertThat(MurderCoverAutoFillService.pickSameGame("호텔레드럼 : 노란 죽음", List.of(c("호텔 레드럼: 노란 죽음")))).isNotNull();
        assertThat(MurderCoverAutoFillService.pickSameGame("이프", List.of(c("이프"), c("미스터리 로얄: 크레이프 크루즈"), c("MEMORY: 달이 지나간 자리")))).isNotNull();
    }

    @Test
    void 후보가_많으면_정확히_같아도_건너뛴다() {
        List<CoverCandidate> many = IntStream.range(0, 8).mapToObj(i -> c(i == 3 ? "타워" : "타워 디펜스 " + i)).toList();
        assertThat(MurderCoverAutoFillService.pickSameGame("타워", many)).isNull();
    }

    @Test
    void 단일_후보에_우리_이름이_통째로_들어_있으면_고른다() {
        assertThat(MurderCoverAutoFillService.pickSameGame("햇살고아원", List.of(c("햇살고아원: 여섯 아이의 탈출극")))).isNotNull();
        assertThat(MurderCoverAutoFillService.pickSameGame("최종 프로토콜", List.of(c("마이 머더 미스터리: 최종 프로토콜")))).isNotNull();
    }

    @Test
    void 우리_이름이_다_안_들어간_후보는_고르지_않는다() {
        assertThat(MurderCoverAutoFillService.pickSameGame("이 어둠을 당신과", List.of(c("암행 어둠을 걷는 자")))).isNull();
        assertThat(MurderCoverAutoFillService.pickSameGame("설화와 회색빛 뭉갠구름", List.of(c("설화와 회색빛 몽견초")))).isNull();
    }

    @Test
    void 후보가_여럿이고_정확히_같은_게_없으면_건너뛴다() {
        assertThat(MurderCoverAutoFillService.pickSameGame("천사", List.of(c("그곳에 천사가 나타났다"), c("천사와 악마가 함께할 때")))).isNull();
    }
}
