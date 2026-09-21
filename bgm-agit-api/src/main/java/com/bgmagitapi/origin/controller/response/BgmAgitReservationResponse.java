package com.bgmagitapi.origin.controller.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BgmAgitReservationResponse {
    
    
    private List<TimeSlotByDate> timeSlots;
    // 날짜별 금액. PER_PERSON 이면 1인 단가, FLAT 이면 안내용 대여료다.
    private List<PriceByDate> prices;
    private String label;
    private String group;
    private Integer minPeople;
    private Integer maxPeople;
    // 예약 후보 시간대 전체(가능/불가 무관). 프론트는 이걸 그대로 그린다.
    private List<SlotRange> slotRanges;
    // 한 번에 선택 가능한 시간대 수. null = 제한 없음
    private Integer maxSelectableSlots;
    // 예약 타입(ROOM / DELEGATE_PLAY) — 서버가 카테고리로 결정
    private String reservationType;
    /**
     * 요금 방식. PER_PERSON = 룸 일무제한(인원 × prices 의 그날 단가), FLAT = 마작 대탁 예약금 정액.
     * 프론트가 항목 라벨로 분기하지 않도록 서버가 내려준다.
     */
    private String pricingMode;
    /**
     * FLAT 일 때의 결제 금액(마작 대탁, 합쳐 예약이면 항목 수만큼 합산).
     * PER_PERSON 이면 인원이 정해지기 전이라 총액을 만들 수 없으므로 null 이다.
     */
    private Integer depositAmount;

    @Getter
    @AllArgsConstructor
    public static class SlotRange {
        private String start;   // "13:00"
        private String end;     // "14:00"
    }

    @Getter
    @AllArgsConstructor
    public static class TimeSlotByDate {
        private LocalDate date;
        private List<String> timeSlots;
        private String message;
    }
    
    @Getter
    @AllArgsConstructor
    public static class PriceByDate {
        private LocalDate date;
        private Integer price;
        private boolean colorGb;
    }
}
