package com.bgmagitapi.origin.clocktower.dto.request;

import lombok.Data;

import java.util.List;

/**
 * 진행판 세션 좌석 1개 = 그 플레이어에게 보여줄 것.
 * roleKey: 플레이어가 "보는" 캐릭터(주정뱅이·꼭두각시·미치광이는 믿는 캐릭터). 사전 키 또는 "c{캐릭터ID}". null=아직 미배정.
 * evil: 보여줄 선악(여행자·진영이 바뀐 경우만), 아니면 null. info: 이야기꾼이 보내는 정보 카드.
 * 이름·진영·능력은 받지 않는다 — 서버가 사전/캐릭터 표에서 채운다.
 */
@Data
public class ClockTowerSessionSeatInput {
    private Long memberId;
    private Integer seatNo;
    private String roleKey;
    private Boolean evil;
    private Info info;

    @Data
    public static class Info {
        private String title;
        private List<String> lines;
    }
}
