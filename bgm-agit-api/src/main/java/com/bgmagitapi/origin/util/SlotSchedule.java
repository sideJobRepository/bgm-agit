package com.bgmagitapi.origin.util;

import com.bgmagitapi.origin.entity.BgmAgitImage;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.origin.entity.enumeration.Reservation;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 예약 항목별 슬롯/이용시간/선택제한 정책의 단일 출처.
 * 프론트에서 imageId 하드코딩으로 중복 구현하지 말고 예약 조회 응답(slotRanges/maxSelectableSlots)을 쓸 것.
 */
public class SlotSchedule {

    private final LocalDateTime open;
    private final LocalDateTime close;
    private final int intervalHours;
    private final int durationHours;

    private SlotSchedule(LocalDateTime open, LocalDateTime close, int intervalHours, int durationHours) {
        this.open = open;
        this.close = close;
        this.intervalHours = intervalHours;
        this.durationHours = durationHours;
    }

    public static SlotSchedule of(BgmAgitImageCategory category, String label, LocalDate d) {
        if (isGroom(category,label)) {
            return new SlotSchedule(
                    LocalDateTime.of(d, LocalTime.of(13, 0)),
                    LocalDateTime.of(d.plusDays(1), LocalTime.of(0, 0)),
                    6,
                    5
            );
        } else if (isMahjongRental(category)) {
            return new SlotSchedule(
                    LocalDateTime.of(d, LocalTime.of(14, 0)),
                    LocalDateTime.of(d.plusDays(1), LocalTime.of(2, 0)),
                    3,
                    3
            );
        } else {
            return new SlotSchedule(
                    LocalDateTime.of(d, LocalTime.of(13, 0)),
                    LocalDateTime.of(d.plusDays(1), LocalTime.of(2, 0)),
                    1,
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

    /** 한 슬롯을 예약했을 때의 실제 이용 시간. G룸은 6시간 간격이지만 이용은 5시간(13~18, 19~00). */
    public int durationHours() {
        return durationHours;
    }

    /** 해당 날짜의 예약 후보 슬롯 전체(예약 가능 여부와 무관). 프론트 시간대 버튼의 원본. */
    public List<Slot> slots() {
        List<Slot> slots = new ArrayList<>();
        for (LocalDateTime cursor = open; cursor.isBefore(close); cursor = cursor.plusHours(intervalHours)) {
            slots.add(new Slot(cursor, cursor.plusHours(durationHours)));
        }
        return slots;
    }

    public record Slot(LocalDateTime start, LocalDateTime end) {
    }

    // ===== 정책 함수들 =====
    public static boolean isGroom(BgmAgitImageCategory category, String label) {
        return category == BgmAgitImageCategory.ROOM && "G Room".equals(label);
    }

    public static boolean isMahjongRental(BgmAgitImageCategory category) {
        return category == BgmAgitImageCategory.MAHJONG;
    }

    /** 한 번에 선택 가능한 슬롯 수. G룸은 하루 1팀 1시간대만, 나머지는 제한 없음(null). */
    public static Integer maxSelectableSlots(BgmAgitImageCategory category, String label) {
        return isGroom(category, label) ? 1 : null;
    }

    /** 예약 타입은 이미지 카테고리에서 서버가 결정한다(클라이언트 값 신뢰 금지). */
    public static Reservation resolveReservationType(BgmAgitImageCategory category) {
        return isMahjongRental(category) ? Reservation.DELEGATE_PLAY : Reservation.ROOM;
    }

    // 예약 예약금(정액): 전 항목 1만원.
    // M Room 3만원 예외가 있었으나 M Room이 M-1/M-2/M-3로 쪼개지면서 제거됨(항목 수만큼 합산되므로 3칸 = 3만원으로 동일).
    // 향후 예약 인원수 기준으로 전환 예정이며, 그때는 category/label만으로 부족해 인원 인자가 추가되어야 한다.
    public static int resolveDepositAmount(BgmAgitImageCategory category, String label) {
        return 10000;
    }

    /**
     * 한 예약(그룹)의 총 예약금. 이미지 id 기준으로 중복을 제거한 뒤 항목 수만큼 합산한다.
     * 결제 주문 금액과 예약 대기 알림톡 안내 금액이 갈리지 않도록 두 곳 모두 이 메서드만 쓸 것.
     */
    public static int totalDepositAmount(Collection<BgmAgitImage> images) {
        if (images == null || images.isEmpty()) {
            return 0;
        }
        Set<Long> countedImageIds = new HashSet<>();
        int total = 0;
        for (BgmAgitImage image : images) {
            if (image == null || !countedImageIds.add(image.getBgmAgitImageId())) {
                continue;
            }
            total += resolveDepositAmount(image.getBgmAgitImageCategory(), image.getBgmAgitImageLabel());
        }
        return total;
    }
}
