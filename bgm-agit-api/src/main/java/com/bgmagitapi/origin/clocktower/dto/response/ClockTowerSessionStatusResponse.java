package com.bgmagitapi.origin.clocktower.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** 이야기꾼용 세션 상태: 좌석마다 보낸 버전과 플레이어가 확인한 버전. 캐릭터 내용은 싣지 않는다 */
@Getter
@Builder
public class ClockTowerSessionStatusResponse {

    private Long sessionId;
    // ACTIVE / CLOSED (18시간이 지나면 CLOSED 로 보인다)
    private String status;
    private List<Seat> seats;

    @Getter
    @Builder
    public static class Seat {
        private Long memberId;
        private Integer seatNo;
        private Integer version;
        private Integer viewedVersion;
        private String viewedAt;
    }
}
