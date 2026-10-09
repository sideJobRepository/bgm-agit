package com.bgmagitapi.origin.util;

import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.entity.enumeration.Reservation;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 예약 항목별 슬롯/이용시간/선택제한 정책의 단일 출처.
 * 프론트에서 roomId 하드코딩으로 중복 구현하지 말고 예약 조회 응답(slotRanges/maxSelectableSlots)을 쓸 것.
 *
 * 룸/마작 구분은 방 링크({@link BgmAgitRoom#isMahjong()}), G룸 판정은 방 이름("G Room")으로 한다.
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

    public static SlotSchedule of(BgmAgitRoom room, LocalDate d) {
        if (isGroom(room)) {
            return new SlotSchedule(
                    LocalDateTime.of(d, LocalTime.of(13, 0)),
                    LocalDateTime.of(d.plusDays(1), LocalTime.of(0, 0)),
                    6,
                    5
            );
        } else if (isMahjongRental(room)) {
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

    /**
     * 손님이 고른 시작 시각들을 이 날의 슬롯으로 바꾼다(시작 순 정렬, 중복 제거).
     * 후보 슬롯에 없는 시각이 하나라도 있으면 빈 목록 — 직접 POST 로 임의 시각을 넣는 것을 막는다.
     */
    public List<Slot> resolveSlots(Collection<LocalTime> startTimes) {
        if (startTimes == null || startTimes.isEmpty()) {
            return List.of();
        }
        List<Slot> candidates = slots();
        List<Slot> picked = new ArrayList<>();
        for (LocalTime startTime : new LinkedHashSet<>(startTimes)) {
            Slot found = candidates.stream()
                    .filter(slot -> slot.start().toLocalTime().equals(startTime))
                    .findFirst()
                    .orElse(null);
            if (found == null) {
                return List.of();
            }
            picked.add(found);
        }
        picked.sort(Comparator.comparing(Slot::start));
        return picked;
    }

    // ===== 연속 구간 / 구간 겹침 =====

    /** 떨어진 시간대를 골랐을 때 등록 거부 문구. */
    public static final String NOT_CONTIGUOUS_MESSAGE = "예약 시간은 연속된 시간대로 선택해 주세요.";

    /**
     * 고른 슬롯들이 빈틈 없이 이어지는지. 예약 1건 = 이어진 시간 한 구간이라 떨어진 시간대는 담을 수 없다.
     * 시작 순으로 정렬한 뒤 앞 슬롯의 종료와 다음 슬롯의 시작이 같은지 본다.
     * 슬롯은 절대시각(LocalDateTime)이라 23:00~02:00 처럼 자정을 넘겨도 그대로 비교된다.
     * G룸(13~18, 19~00)은 두 슬롯 사이에 1시간이 비어 있어 두 개를 고르면 여기서 걸린다.
     */
    public static boolean isContiguous(List<Slot> slots) {
        if (slots == null || slots.isEmpty()) {
            return false;
        }
        List<Slot> sorted = new ArrayList<>(slots);
        sorted.sort(Comparator.comparing(Slot::start));
        for (int i = 1; i < sorted.size(); i++) {
            if (!sorted.get(i - 1).end().equals(sorted.get(i).start())) {
                return false;
            }
        }
        return true;
    }

    /**
     * 영업일 경계. 이 시각 이전은 그 영업일의 익일 새벽이다(마감이 00:00·02:00 로 넘어가는 G룸·마작대여).
     * 현황판 분값(+1440)·알림톡 정렬·예약 구간 해석이 모두 이 값을 쓴다.
     */
    public static final LocalTime DAY_BOUNDARY = LocalTime.of(6, 0);

    /** 영업일 기준 정렬용 분값. 경계 이전은 +1440 해서 뒤로 보낸다. 프론트 현황판도 같은 규약이다. */
    public static int toSortableMinutes(LocalTime time) {
        if (time == null) {
            return 0;
        }
        int minutes = time.getHour() * 60 + time.getMinute();
        return time.isBefore(DAY_BOUNDARY) ? minutes + 24 * 60 : minutes;
    }

    /**
     * 예약 한 건(영업일 + 시작·종료 시각)을 절대시각 구간으로 바꾼다.
     * 시작이 경계(06시) 이전이면 익일 새벽 시작이고, 종료가 시작보다 이르거나 같으면 다음 날로 넘어간 것이다.
     */
    public static Slot toPeriod(LocalDate businessDate, LocalTime startTime, LocalTime endTime) {
        if (businessDate == null || startTime == null || endTime == null) {
            return null;
        }
        LocalDate startDate = startTime.isBefore(DAY_BOUNDARY) ? businessDate.plusDays(1) : businessDate;
        LocalDateTime start = LocalDateTime.of(startDate, startTime);
        LocalDateTime end = LocalDateTime.of(startDate, endTime);
        if (!end.isAfter(start)) {
            end = end.plusDays(1);
        }
        return new Slot(start, end);
    }

    /** 두 구간이 겹치는지. 끝과 시작이 맞닿는 것(14:00 종료 / 14:00 시작)은 겹침이 아니다. */
    public static boolean overlaps(Slot a, Slot b) {
        if (a == null || b == null) {
            return false;
        }
        return a.start().isBefore(b.end()) && b.start().isBefore(a.end());
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
    public static boolean isGroom(BgmAgitRoom room) {
        return room != null && !room.isMahjong() && "G Room".equals(room.getBgmAgitRoomName());
    }

    public static boolean isMahjongRental(BgmAgitRoom room) {
        return room != null && room.isMahjong();
    }

    /** 한 번에 선택 가능한 슬롯 수. G룸은 하루 1팀 1시간대만, 나머지는 제한 없음(null). */
    public static Integer maxSelectableSlots(BgmAgitRoom room) {
        return isGroom(room) ? 1 : null;
    }

    /** 예약 타입은 방 링크(룸/마작)로 서버가 결정한다(클라이언트 값 신뢰 금지). */
    public static Reservation resolveReservationType(BgmAgitRoom room) {
        return isMahjongRental(room) ? Reservation.DELEGATE_PLAY : Reservation.ROOM;
    }

    // 예약 예약금(정액): 전 항목 1만원.
    // M Room 3만원 예외가 있었으나 M Room이 M-1/M-2/M-3로 쪼개지면서 제거됨(항목 수만큼 합산되므로 3칸 = 3만원으로 동일).
    // 향후 예약 인원수 기준으로 전환 예정이며, 그때는 방만으로 부족해 인원 인자가 추가되어야 한다.
    public static int resolveDepositAmount(BgmAgitRoom room) {
        return 10000;
    }

    /**
     * 한 예약의 총 예약금. 방 id 기준으로 중복을 제거한 뒤 방 수만큼 합산한다.
     * 결제 주문 금액과 예약 대기 알림톡 안내 금액이 갈리지 않도록 두 곳 모두 이 메서드만 쓸 것.
     */
    public static int totalDepositAmount(Collection<BgmAgitRoom> rooms) {
        if (rooms == null || rooms.isEmpty()) {
            return 0;
        }
        Set<Long> countedRoomIds = new HashSet<>();
        int total = 0;
        for (BgmAgitRoom room : rooms) {
            if (room == null || !countedRoomIds.add(room.getBgmAgitRoomId())) {
                continue;
            }
            total += resolveDepositAmount(room);
        }
        return total;
    }
}
