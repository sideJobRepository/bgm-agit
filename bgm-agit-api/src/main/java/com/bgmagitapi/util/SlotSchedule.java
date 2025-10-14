package com.bgmagitapi.util;

import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class SlotSchedule {
    
    private final LocalDateTime open;
    private final LocalDateTime close;
    private final int intervalHours;
    
    private SlotSchedule(LocalDateTime open, LocalDateTime close, int intervalHours) {
        this.open = open;
        this.close = close;
        this.intervalHours = intervalHours;
    }
    
    public static SlotSchedule of(BgmAgitImageCategory category, String label, LocalDate d) {
        if (isGroom(category,label)) {
            return new SlotSchedule(
                    LocalDateTime.of(d, LocalTime.of(13, 0)),
                    LocalDateTime.of(d.plusDays(1), LocalTime.of(0, 0)),
                    6
            );
        } else if (isMahjongRental(category)) {
            return new SlotSchedule(
                    LocalDateTime.of(d, LocalTime.of(14, 0)),
                    LocalDateTime.of(d.plusDays(1), LocalTime.of(2, 0)),
                    3
            );
        } else {
            return new SlotSchedule(
                    LocalDateTime.of(d, LocalTime.of(13, 0)),
                    LocalDateTime.of(d.plusDays(1), LocalTime.of(2, 0)),
                    1
            );
        }
    }
    
    public LocalDateTime open() {
        return open;
    }
    
    public LocalDateTime close() {
        return close;
    }
    
    public int intervalHours() {
        return intervalHours;
    }
    
    // ===== 정책 함수들 =====
    public static boolean isGroom(BgmAgitImageCategory category, String label) {
        return category == BgmAgitImageCategory.ROOM && "G Room".equals(label);
    }
    
    public static boolean isMahjongRental(BgmAgitImageCategory category) {
        return category == BgmAgitImageCategory.MAHJONG;
    }
}
