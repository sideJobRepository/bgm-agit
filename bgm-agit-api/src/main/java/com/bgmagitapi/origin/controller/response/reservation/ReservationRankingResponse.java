package com.bgmagitapi.origin.controller.response.reservation;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 관리자 예약 랭킹(월별). 확정된 예약만, 이용일 기준으로 센다.
 * people 이 있으면 그 인원으로 예약한 건만 센 랭킹이다(인원수별 세분화).
 */
@Getter
@AllArgsConstructor
public class ReservationRankingResponse {

    // "2026-11"
    private String month;
    // 인원수별 보기에서 고를 수 있는 인원(그 달 확정 예약에 실제로 나온 값), 오름차순
    private List<Integer> peopleOptions;
    // 지금 보고 있는 인원 필터. 전체면 null
    private Integer people;
    // 그 달(필터 적용) 확정 예약 건수·인원 합계
    private long totalReservations;
    private long totalPeople;
    private List<Item> items;

    @Getter
    @AllArgsConstructor
    public static class Item {
        // 공동 순위(예약 횟수가 같으면 같은 순위)
        private int rank;
        private Long memberId;
        private String memberName;
        private String memberNickname;
        private String phoneNo;
        private long reservationCount;
        private long totalPeople;
    }
}
