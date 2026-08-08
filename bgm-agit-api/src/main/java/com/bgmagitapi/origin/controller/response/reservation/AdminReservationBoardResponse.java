package com.bgmagitapi.origin.controller.response.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 관리자 예약 현황판(하루치) 응답.
 * 예약번호(BGM_AGIT_RESERVATION_NO) 단위로 슬롯 행을 묶고, 예약 장소별로 다시 묶어서 내려준다.
 */
@Getter
@AllArgsConstructor
public class AdminReservationBoardResponse {

    private LocalDate date;
    private Summary summary;
    private List<Room> rooms;

    @Getter
    @AllArgsConstructor
    public static class Summary {
        // 취소 제외 예약 건수
        private int total;
        private int confirmed;
        private int waiting;
        private int canceled;
        // 취소 제외 인원 합계
        private int people;
    }

    @Getter
    @AllArgsConstructor
    public static class Room {
        private String roomName;
        // BgmAgitImageCategory 이름(ROOM / MAHJONG ...). 프론트 탭 분류에 쓴다.
        // 마작탁은 라벨이 한글(대탁·렉스탁)이라 라벨 첫 글자로는 룸과 구분되지 않음.
        private String category;
        private List<Item> reservations;
    }

    @Getter
    @AllArgsConstructor
    public static class Item {
        private Long reservationNo;
        private String memberName;
        private String phoneNo;
        private Integer people;
        private String request;
        private String approvalStatus;
        private String cancelStatus;
        private String receiptUrl;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        private LocalDateTime registDate;

        // 표시용 시간 문자열 ("13:00")
        private String startTime;
        private String endTime;

        /*
         * 현황판 가로축 계산용 분값. 자정 기준이되 06시 이전은 +1440 한다.
         * 마감이 00:00 / 02:00 로 넘어가는 슬롯(G룸·마작대여)이 있어서,
         * 그대로 쓰면 종료가 시작보다 앞서는 것으로 계산되기 때문.
         */
        private int startMinutes;
        private int endMinutes;
    }
}
