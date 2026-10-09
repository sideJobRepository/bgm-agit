package com.bgmagitapi.origin.util;

import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.entity.enumeration.Reservation;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 예약 항목별 슬롯/이용시간/요금/선택제한 정책의 단일 출처.
 * 프론트에서 roomId 하드코딩으로 중복 구현하지 말고 예약 조회 응답(slotRanges/maxSelectableSlots/prices)을 쓸 것.
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

    // ===== 하루 경계 =====

    /**
     * 영업 하루의 경계. 이 시각 이전(00:00~09:59)은 앞 날짜의 영업일에 속한다.
     *
     * 24시간 영업으로 바뀌면서 "당일 10시 ~ 익일 10시"가 일무제한 요금의 하루가 되었고
     * 예약 슬롯도 같은 경계를 쓴다. 예전에는 이 경계가 세 곳에 다른 값으로 흩어져 있었다
     * (슬롯 13:00 / 알림톡 정렬 13:00 / 현황판 06:00). 그러면 화면·알림톡·환불이
     * 서로 다른 하루를 보게 되므로 전부 이 상수 하나만 보도록 모았다.
     */
    public static final LocalTime DAY_BOUNDARY = LocalTime.of(10, 0);

    /**
     * 슬롯 시각을 실제 일시로 환산한다. 경계(10시) 이전이면 익일이다.
     *
     * 예약 행은 익일 새벽 슬롯도 시작 날짜(startDate)를 당일로 들고 있어서
     * LocalDateTime.of(startDate, startTime) 을 그대로 쓰면 24시간이 틀어진다.
     * 환불 기한 판정·현황판 정렬·알림톡 종료시각이 모두 이 메서드를 거쳐야 한다.
     */
    public static LocalDateTime slotDateTime(LocalDate startDate, LocalTime time) {
        if (startDate == null || time == null) {
            return null;
        }
        return time.isBefore(DAY_BOUNDARY)
                ? LocalDateTime.of(startDate.plusDays(1), time)
                : LocalDateTime.of(startDate, time);
    }

    /**
     * 현황판·알림톡 정렬용 분(minute) 값. 경계 이전은 +1440 되어 뒤로 밀린다.
     * 프론트 현황판도 같은 규약을 쓴다.
     */
    public static int toSortableMinutes(LocalTime time) {
        if (time == null) {
            return 0;
        }
        int minutes = time.getHour() * 60 + time.getMinute();
        return time.isBefore(DAY_BOUNDARY) ? minutes + 24 * 60 : minutes;
    }

    /**
     * 예약 한 건의 실제 이용 구간 [start, end).
     *
     * 시작·종료를 각각 slotDateTime 으로 환산하고, 종료가 시작보다 이르거나 같으면 하루를 더한다.
     *  - 23:00~02:00 (마작) → 당일 23시 ~ 익일 02시
     *  - 08:00~10:00 (룸 마지막 두 칸) → 익일 08시 ~ 익일 10시
     *  - 10:00~10:00 (룸 하루 전체) → 당일 10시 ~ 익일 10시
     * 환불 기한·충돌 판정·현황판·알림톡이 전부 이 계산 하나를 거쳐야 서로 같은 구간을 본다.
     */
    public static Slot useRange(LocalDate startDate, LocalTime startTime, LocalTime endTime) {
        LocalDateTime start = slotDateTime(startDate, startTime);
        LocalDateTime end = slotDateTime(startDate, endTime);
        if (start == null || end == null) {
            return null;
        }
        if (!end.isAfter(start)) {
            end = end.plusDays(1);
        }
        return new Slot(start, end);
    }

    /** 두 구간 [aStart, aEnd) 와 [bStart, bEnd) 가 겹치는지. 끝과 시작이 맞닿기만 하면 겹침이 아니다. */
    public static boolean isOverlapping(LocalDateTime aStart, LocalDateTime aEnd, LocalDateTime bStart, LocalDateTime bEnd) {
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }

    // ===== 슬롯 =====

    public static SlotSchedule of(BgmAgitRoom room, LocalDate d) {
        return of(isMahjongRental(room), d);
    }

    public static SlotSchedule of(boolean mahjongRental, LocalDate d) {
        if (mahjongRental) {
            // 마작 대탁 대여는 개편 대상이 아니다. 3시간 단위 유지 — 시간 모델을 룸과 합치지 말 것
            return new SlotSchedule(
                    LocalDateTime.of(d, LocalTime.of(14, 0)),
                    LocalDateTime.of(d.plusDays(1), LocalTime.of(2, 0)),
                    3,
                    3
            );
        }
        // 룸은 일무제한 — 24시간 영업이라 하루 경계부터 다음 경계까지 1시간 단위로 전부 연다.
        // 요금은 시간 수와 무관(인원 × 단가)하고, 시간 선택은 룸 점유 구간을 잡는 의미만 갖는다.
        return new SlotSchedule(
                LocalDateTime.of(d, DAY_BOUNDARY),
                LocalDateTime.of(d.plusDays(1), DAY_BOUNDARY),
                1,
                1
        );
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

    /** 한 슬롯을 예약했을 때의 실제 이용 시간. */
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

    /**
     * 선택된 시작시각들이 슬롯 순서상 연속인지. 비어 있으면 false.
     *
     * 일무제한이라 시간 수가 금액을 바꾸지는 않지만, 13시와 20시를 띄엄띄엄 고르면
     * 그 사이 시간에 룸이 비어 보이면서도 실제로는 쓸 수 없는 상태가 된다.
     */
    public boolean isContiguous(Collection<LocalTime> startTimes) {
        if (startTimes == null || startTimes.isEmpty()) {
            return false;
        }
        List<LocalTime> order = slots().stream().map(slot -> slot.start().toLocalTime()).toList();
        List<Integer> picked = new ArrayList<>();
        for (LocalTime startTime : new HashSet<>(startTimes)) {
            int index = order.indexOf(startTime);
            if (index < 0) {
                return false;
            }
            picked.add(index);
        }
        picked.sort(Integer::compareTo);
        for (int i = 1; i < picked.size(); i++) {
            if (picked.get(i) - picked.get(i - 1) != 1) {
                return false;
            }
        }
        return true;
    }

    /**
     * 선택된 시작시각들이 덮는 구간(첫 슬롯 시작 ~ 마지막 슬롯 끝). 연속 여부는 isContiguous 로 먼저 확인할 것.
     * 슬롯 순서(영업일 기준)로 정렬하므로 자정을 넘는 선택도 올바른 구간이 나온다. 후보에 없는 시각이 있으면 null.
     */
    public Slot span(Collection<LocalTime> startTimes) {
        if (startTimes == null || startTimes.isEmpty()) {
            return null;
        }
        List<Slot> all = slots();
        List<LocalTime> order = all.stream().map(slot -> slot.start().toLocalTime()).toList();
        int first = Integer.MAX_VALUE;
        int last = -1;
        for (LocalTime startTime : startTimes) {
            int index = order.indexOf(startTime);
            if (index < 0) {
                return null;
            }
            first = Math.min(first, index);
            last = Math.max(last, index);
        }
        return new Slot(all.get(first).start(), all.get(last).end());
    }

    // ===== 예약 가능 기간(리드타임) =====

    /**
     * 예약 가능 기간 상한 — 현재일 기준 3개월.
     *
     * 토스페이먼츠 카드사 심사 요건("예약 가능 기간을 현재일 기준 최대 6개월 이내")을 만족시키기 위한 정책이며,
     * 동시에 서비스제공기간이 6개월을 넘지 않는다는 근거가 된다.
     * 값을 바꾸면 예약 조회 슬롯 생성 범위·등록 검증·프론트 캘린더 maxDate가 함께 따라오므로
     * 반드시 이 상수만 고칠 것(프론트는 RESERVATION_WINDOW_MONTHS 를 별도로 들고 있다).
     */
    public static final int RESERVATION_WINDOW_MONTHS = 3;

    /** 예약 가능한 첫 날짜. 당일 예약은 불가하므로 내일부터. */
    public static LocalDate firstReservableDate(LocalDate today) {
        return today.plusDays(1);
    }

    /**
     * 이 날짜부터는 예약을 받지 않는다. 막을 필요가 없어지면 null 로 둔다.
     *
     * 예약 정책 개편(일무제한·전액결제·3단계 환불)이 아직 오픈 전이다. 10월까지는 현행 정책으로 받고 11월부터 막는다.
     * 지금 화면으로 11월 이후 예약을 받으면 예약금 1만원·전날까지 전액환불로 안내해 놓고
     * 오픈 후에는 전액결제·3단계 환불이 적용되어 고지한 내용과 실제가 갈린다.
     * 개편을 여는 시점에 이 상수만 null 로 바꾸면 3개월 창이 그대로 돌아온다.
     */
    public static final LocalDate RESERVATION_BLOCKED_FROM = LocalDate.of(2026, 11, 1);

    /** 차단 기간 안내 문구. 조회 응답 message 와 등록 예외가 같은 문구를 쓴다. */
    public static final String RESERVATION_BLOCKED_MESSAGE =
            "11월 예약은 준비 중입니다. 공지 후 오픈되면 이용해 주세요.";

    /** 아직 열지 않은 기간의 날짜인지. */
    public static boolean isBlockedDate(LocalDate date) {
        return RESERVATION_BLOCKED_FROM != null && !date.isBefore(RESERVATION_BLOCKED_FROM);
    }

    /**
     * 예약 가능한 마지막 날짜.
     *
     * 차단 시작일이 걸려 있으면 그 전날까지로 줄인다. 이 값 하나가 조회 슬롯 생성 범위와
     * isWithinReservableWindow 를 동시에 좁히므로, 차단하려고 호출부를 따로 고칠 필요가 없다.
     */
    public static LocalDate lastReservableDate(LocalDate today) {
        LocalDate windowEnd = today.plusMonths(RESERVATION_WINDOW_MONTHS);
        if (RESERVATION_BLOCKED_FROM == null) {
            return windowEnd;
        }
        LocalDate beforeBlocked = RESERVATION_BLOCKED_FROM.minusDays(1);
        return windowEnd.isAfter(beforeBlocked) ? beforeBlocked : windowEnd;
    }

    /** 예약 가능 기간 안의 날짜인지. 과거·당일·상한 초과를 모두 거른다. */
    public static boolean isWithinReservableWindow(LocalDate date, LocalDate today) {
        return !date.isBefore(firstReservableDate(today)) && !date.isAfter(lastReservableDate(today));
    }

    // ===== 휴무일 =====

    /**
     * 무인운영으로 예약을 받지 않는 요일.
     * 예약 조회(방 목록 가용 현황)·등록 검증·프론트 캘린더가 모두 이 값을 보게 하고, 바꿀 때는 이 상수만 고칠 것.
     */
    public static final DayOfWeek CLOSED_DAY_OF_WEEK = DayOfWeek.WEDNESDAY;

    /** 휴무일 안내 문구. 등록 시 예외 메시지와 조회 응답 message 가 같은 문구를 쓴다. */
    public static final String CLOSED_DAY_MESSAGE = "수요일은 무인운영으로 예약이 불가능합니다.";

    public static boolean isClosedDay(LocalDate date) {
        return date.getDayOfWeek() == CLOSED_DAY_OF_WEEK;
    }

    /**
     * 휴무 요일을 자바스크립트 Date.getDay() 규약(0=일 … 6=토)으로 변환한 값.
     * 자바 DayOfWeek 는 1=월 … 7=일이라 그대로 내보내면 프론트에서 하루가 밀린다.
     * % 7 을 태우면 월~토(1~6)는 그대로, 일요일만 7 → 0 이 되어 JS 규약과 정확히 일치한다.
     */
    public static int closedWeekdayForJs() {
        return CLOSED_DAY_OF_WEEK.getValue() % 7;
    }

    // ===== 정책 함수들 =====

    public static boolean isMahjongRental(BgmAgitRoom room) {
        return room != null && room.isMahjong();
    }

    /**
     * 한 번에 선택 가능한 슬롯 수. 제한이 없으면 null — 지금은 전 항목 제한 없음.
     * 룸 8시간 상한은 사장님이 요청(2026-09-22)했다가 철회(2026-10-09)했다. 다시 넣지 말 것.
     * 응답 필드(maxSelectableSlots)와 프론트 안내는 남겨 둔다.
     */
    public static Integer maxSelectableSlots(boolean mahjongRental) {
        return null;
    }

    public static Integer maxSelectableSlots(BgmAgitRoom room) {
        return maxSelectableSlots(isMahjongRental(room));
    }

    /** 예약 타입은 방(메뉴 링크)에서 서버가 결정한다(클라이언트 값 신뢰 금지). */
    public static Reservation resolveReservationType(boolean mahjongRental) {
        return mahjongRental ? Reservation.DELEGATE_PLAY : Reservation.ROOM;
    }

    // ===== 합쳐 예약 =====

    /**
     * 함께 예약할 수 있는 항목 라벨의 조합.
     *
     * 예전에는 maxSelectableSlots != null (=G룸) 인지로 합치기를 걸렀는데, 모든 룸의 슬롯 제한이
     * 풀리면서 그 조건이 항상 false 가 되어 방어가 통째로 사라졌다. 화이트리스트로 바꿔
     * 서버가 허용 조합을 직접 들고 있게 한다(프론트 RESERVATION_COMBINABLE_GROUPS 와 같은 값).
     */
    private static final List<Set<String>> COMBINABLE_LABEL_GROUPS = List.of(
            Set.of("M-1", "M-2", "M-3")
    );

    /** 항목이 하나면 항상 true. 여럿이면 같은 조합 그룹 안에 전부 들어 있어야 한다. */
    public static boolean isCombinable(Collection<String> labels) {
        if (labels == null || labels.isEmpty()) {
            return false;
        }
        if (labels.size() == 1) {
            return true;
        }
        return COMBINABLE_LABEL_GROUPS.stream().anyMatch(group -> group.containsAll(labels));
    }

    // ===== 요금 =====

    /** 마작 대탁 대여 예약금(정액). 룸과 달리 예약금 + 현장결제 방식이 유지된다. */
    public static final int MAHJONG_DEPOSIT_AMOUNT = 10000;

    private static final int WEEKDAY_UNIT_PRICE = 9000;
    private static final int WEEKEND_UNIT_PRICE = 11000;

    /**
     * 룸 일무제한 1인 단가.
     *
     * 주말 단가 여부는 날짜만으로 정할 수 없어서 인자로 받는다 — 토·일뿐 아니라 공휴일도
     * 주말 단가이고, 공휴일은 법정공휴일 계산(LunarCalendar)에 관리자 수동 예외를 얹어야
     * 알 수 있다(선거일·임시공휴일은 계산으로 안 나온다). 판정은 BgmAgitHolidayService 가 한다.
     */
    public static int unitPrice(boolean weekendRate) {
        return weekendRate ? WEEKEND_UNIT_PRICE : WEEKDAY_UNIT_PRICE;
    }

    /**
     * 한 예약(그룹)의 결제 총액.
     *
     * 룸은 인원 × 단가이며 항목 수를 곱하지 않는다 — 합쳐 예약(M-1+M-2)을 쓰는 이유가
     * 인원이 많아서이고 그 인원만큼 이미 청구되므로, 항목 수까지 곱하면 이중과금이다.
     * 마작 대탁만 예전 방식대로 항목당 정액을 합산한다.
     *
     * 결제 주문 금액과 예약 대기 알림톡 안내 금액이 갈리지 않도록 두 곳 모두 이 메서드만 쓸 것.
     */
    public static int totalPaymentAmount(Collection<BgmAgitRoom> rooms, int people, boolean weekendRate) {
        if (rooms == null || rooms.isEmpty()) {
            return 0;
        }
        BgmAgitRoom first = rooms.iterator().next();
        if (isMahjongRental(first)) {
            Set<Long> countedRoomIds = new HashSet<>();
            int total = 0;
            for (BgmAgitRoom room : rooms) {
                if (room == null || !countedRoomIds.add(room.getBgmAgitRoomId())) {
                    continue;
                }
                total += MAHJONG_DEPOSIT_AMOUNT;
            }
            return total;
        }
        return Math.max(people, 0) * unitPrice(weekendRate);
    }
}
