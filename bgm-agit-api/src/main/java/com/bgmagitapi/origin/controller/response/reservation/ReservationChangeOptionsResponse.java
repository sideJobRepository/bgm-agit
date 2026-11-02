package com.bgmagitapi.origin.controller.response.reservation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 예약 변경 모달용 옵션(GET /reservation/change-options). 인원(people)을 바꿀 때마다 다시 조회한다.
 * 금액은 미리보기일 뿐이고 실제 청구·환불은 변경 요청 때 서버가 다시 계산한다.
 */
@Getter
@Builder
@AllArgsConstructor
public class ReservationChangeOptionsResponse {

    private Long reservationId;
    // yyyy-MM-dd
    private String reservationDate;
    // HH:mm
    private String startTime;
    private String endTime;

    private int currentPeople;
    private List<Long> currentRoomIds;
    private String currentRoomNames;

    // 이번 조회 기준 인원
    private int people;
    // 스테퍼 범위 = 모든 후보 방 집합의 최소 min ~ 최대 max(빈 방 여부 무관)
    private int peopleMin;
    private int peopleMax;

    // 원결제 1인 단가 스냅샷(미결제·정액이면 null)
    private Integer unitPrice;
    // 결제 확정 예약인지
    private boolean approved;
    // 마작 대탁(정액)인지. 인원이 금액과 무관해 추가결제·환불 안내를 띄우지 않는다(관리자 기록 정정만)
    private boolean flat;
    // 지금 기준 환불 비율(%)
    private int refundRate;
    // 손님 변경 마감(이용 시작 − 24h) yyyy-MM-dd HH:mm
    private String deadline;

    // 지금 이 사람이 변경 가능한지와 불가 사유
    private boolean changeable;
    private String message;

    // people 을 수용하고 그 시간대에 빈 방 집합만. current 먼저, 그다음 라벨순
    private List<RoomOption> rooms;

    // 확정 예약 증원 시 추가결제액
    private int addPeople;
    private int addAmount;

    // 감소 인원, 그중 환불 대상(확정 예약이면 감소 인원 전부), 예상 환불액(비율 적용, 결제 잔액으로 클램프)
    private int reducePeople;
    private int refundPeople;
    private int refundAmount;

    @Getter
    @AllArgsConstructor
    public static class RoomOption {
        private List<Long> roomIds;
        // "G Room" / "M-1, M-2"
        private String label;
        private Integer minPeople;
        private Integer maxPeople;
        private boolean current;
    }
}
