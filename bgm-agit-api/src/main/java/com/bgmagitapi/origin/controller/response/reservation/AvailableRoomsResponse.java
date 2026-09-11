package com.bgmagitapi.origin.controller.response.reservation;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

/**
 * 특정 날짜의 예약 항목별 가용 현황.
 *
 * 예약 플로우가 "날짜 → 방 → 시간" 순이 되면서, 방을 고르기 전에 그 날짜에 어느 방이 비었는지
 * 보여주기 위한 조회다. 실제로 선택 가능한 시간대의 단일 출처는 여전히 GET /bgm-agit/reservation 이며
 * (합쳐 예약 교집합·maxSelectableSlots·가격이 그쪽에만 있다), 여기서는 개수만 내려준다.
 */
@Getter
@AllArgsConstructor
public class AvailableRoomsResponse {

    /** 요청한 날짜 그대로. 프론트가 날짜를 빠르게 바꿀 때 늦게 도착한 응답을 버리는 데 쓴다. */
    private LocalDate date;

    /** 그 날짜 전체가 예약 불가(당일·예약가능기간 밖·휴무일)인지. */
    private boolean closed;

    /** closed 사유. 정상이면 null. */
    private String message;

    /**
     * 휴무 요일. 자바스크립트 Date.getDay() 규약(0=일 … 3=수 … 6=토)이라 프론트가 그대로 비교하면 된다.
     * 자바 DayOfWeek(1=월 … 7=일)를 그대로 내보내지 않는 이유는 SlotSchedule.closedWeekdayForJs() 주석 참고.
     */
    private int closedWeekday;

    private List<Room> rooms;

    @Getter
    @AllArgsConstructor
    public static class Room {
        private Long imageId;
        private String label;
        /** 인원 안내 문구(BGM_AGIT_IMAGE_GROUPS). 카드에 그대로 표시된다. */
        private String group;
        /** BgmAgitImageCategory 이름(ROOM / MAHJONG ...). */
        private String category;
        private Integer minPeople;
        private Integer maxPeople;

        /** 그 날짜의 후보 슬롯 총수. 일반 룸 13 / G Room 2 / 마작 대여 4 로 제각각이라 분모가 필요하다. */
        private int totalSlotCount;
        private int availableSlotCount;
        private boolean available;

        /**
         * 항목 단위 불가 사유(예: G룸은 하루 1팀). "마감"과 구분해서 이유를 보여주기 위한 값이고,
         * 없으면 null.
         */
        private String message;
    }
}
