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
