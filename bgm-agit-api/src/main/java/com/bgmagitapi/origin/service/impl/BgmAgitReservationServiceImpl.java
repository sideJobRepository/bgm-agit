package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationPeopleRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.origin.controller.response.reservation.AdminReservationBoardResponse;
import com.bgmagitapi.origin.controller.response.reservation.AvailableRoomsResponse;
import com.bgmagitapi.origin.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.controller.response.reservation.TimeRange;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.event.dto.ReservationTalkEvent;
import com.bgmagitapi.origin.event.dto.ReservationWaitingEvent;
import com.bgmagitapi.origin.event.dto.TalkAction;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.payment.service.response.PaymentRefundResult;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.repository.BgmAgitRoomRepository;
import com.bgmagitapi.origin.service.BgmAgitHolidayService;
import com.bgmagitapi.origin.service.BgmAgitReservationService;
import com.bgmagitapi.origin.service.response.ReservationTalkContext;
import com.bgmagitapi.origin.util.ReservationRefundPolicy;
import com.bgmagitapi.origin.util.SlotSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {

    /** 영업 기준 시간대. 서버 JVM 타임존에 기대지 말고 날짜 판단은 항상 이걸로 한다. */
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    /** 마작 대탁 3시간 대여료. 조회 응답의 안내용 금액이며 결제 금액과는 별개다. */
    private static final int MAHJONG_RENTAL_PRICE = 40000;

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    /** 떨어진 시간대 선택 거절 문구. 프론트도 같은 규칙(붙은 칸만 선택)으로 막는다. */
    static final String NOT_CONTIGUOUS_MESSAGE = "예약 시간은 연속된 시간대로 선택해 주세요.";

    private final BgmAgitRoomRepository bgmAgitRoomRepository;

    private final BgmAgitMemberRepository bgmAgitMemberRepository;

    private final BgmAgitReservationRepository bgmAgitReservationRepository;

    private final ApplicationEventPublisher eventPublisher;

    private final PaymentService paymentService;

    private final BgmAgitPaymentRepository bgmAgitPaymentRepository;

    // 요금의 주말/평일 판정. 토·일 + 공휴일(법정 계산 + 관리자 수동 예외)
    private final BgmAgitHolidayService bgmAgitHolidayService;

    @Override
    @Transactional(readOnly = true)
    public BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id, LocalDate date) {
        return getReservation(labelGb, link, id, null, date);
    }

    /**
     * 예약 캘린더. id/ids 는 방 ID(BGM_AGIT_ROOM_ID) 다. labelGb 는 이미지 메뉴 시절의 값이라 쓰지 않는다.
     */
    @Override
    @Transactional(readOnly = true)
    public BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id, List<Long> extraIds, LocalDate date) {
        Long userId = currentUserIdOrNull();
        // 조회 범위는 예약 가능 기간(현재일 +RESERVATION_WINDOW_MONTHS) 안으로 잘라낸다.
        // date 는 클라이언트가 보내는 값이라 그대로 쓰면 과거 날짜나 몇 년 뒤 슬롯까지 내려간다.
        LocalDate now = LocalDate.now(KST);
        LocalDate today = date.isBefore(now) ? now : date;
        LocalDate windowEnd = SlotSchedule.lastReservableDate(now);
        LocalDate endOfWindow = today.plusMonths(SlotSchedule.RESERVATION_WINDOW_MONTHS).isAfter(windowEnd)
                ? windowEnd
                : today.plusMonths(SlotSchedule.RESERVATION_WINDOW_MONTHS);
        // 1. 대상 방 조회 (첫 번째가 기준 방, 나머지는 합쳐 쓸 방)
        List<BgmAgitRoom> rooms = loadReservableRooms(mergeRoomIds(id, extraIds));
        BgmAgitRoom primary = rooms.get(0);
        boolean mahjong = primary.isMahjong();
        // 방 정보는 1회 세팅 (전 기간 만실이어도 제목/인원이 비지 않게)
        String label = rooms.stream()
                .map(BgmAgitRoom::getBgmAgitRoomName)
                .collect(Collectors.joining(", "));
        String group = primary.getBgmAgitRoomGuide();
        // 합쳐 쓸 때 최소인원은 가장 큰 최소값, 최대인원은 합산. 등록 검증도 같은 규칙을 쓴다
        Integer minPeople = effectiveMinPeople(rooms);
        Integer maxPeople = effectiveMaxPeople(rooms);

        // 2. 방별 예약 현황 Map<영업일, List<TimeRange>> — 방 수와 무관하게 쿼리 1회
        Map<Long, List<ReservedTimeDto>> reservedByRoom = bgmAgitReservationRepository.findReservedTimesByRoomIds(
                rooms.stream().map(BgmAgitRoom::getBgmAgitRoomId).toList(), today, endOfWindow);
        List<Map<LocalDate, List<TimeRange>>> reservedMaps = rooms.stream()
                .map(room -> ReservedTimeDto.groupedReservation(
                        reservedByRoom.getOrDefault(room.getBgmAgitRoomId(), List.of())))
                .toList();

        // 3. 날짜별 시간 슬롯 생성 (여러 방이면 전부 비어 있는 시간만 = 교집합)
        List<BgmAgitReservationResponse.TimeSlotByDate> timeSlots = new ArrayList<>();

        for (LocalDate d = today; !d.isAfter(endOfWindow); d = d.plusDays(1)) {
            if (d.isEqual(now)) {
                timeSlots.add(new BgmAgitReservationResponse.TimeSlotByDate(
                        d,
                        List.of(),
                        "당일 예약은 불가능합니다."
                ));
                continue;
            }

            List<String> availableSlots = null;
            String blockedMessage = null;

            for (int i = 0; i < rooms.size(); i++) {
                DayAvailability availability = resolveDayAvailability(
                        rooms.get(i), reservedMaps.get(i), d, today, userId);
                if (availability.message() != null) {
                    blockedMessage = availability.message();
                    availableSlots = List.of();
                    break;
                }
                if (availableSlots == null) {
                    availableSlots = new ArrayList<>(availability.slots());
                } else {
                    availableSlots.retainAll(availability.slots());
                }
            }

            timeSlots.add(new BgmAgitReservationResponse.TimeSlotByDate(
                    d,
                    availableSlots == null ? List.of() : availableSlots,
                    blockedMessage));
        }

        // 4. 날짜별 1인 단가 계산
        //
        // 조회 시점에는 인원이 아직 정해지지 않아(인원 입력이 예약 확인 모달에서 일어난다)
        // 총액을 만들 수 없다. 그래서 단가만 내려주고 프론트가 "인원 × 단가"를 미리보기로 조립한다.
        // 실제 청구는 결제 주문 생성 시 서버가 저장된 인원으로 다시 계산한다.
        List<BgmAgitReservationResponse.PriceByDate> prices = new ArrayList<>();

        for (LocalDate d = today; !d.isAfter(endOfWindow); d = d.plusDays(1)) {
            if (d.isEqual(now)) {
                continue;
            }
            // 토·일 + 공휴일(법정 계산 + 관리자 수동 예외)이 주말 단가다
            boolean isWeekend = bgmAgitHolidayService.isWeekendRate(d);
            // 마작 대탁은 개편 대상이 아니라 예전 그대로 3시간 대여료를 그대로 내려준다(1인 단가가 아니다)
            int price = mahjong
                    ? MAHJONG_RENTAL_PRICE
                    : SlotSchedule.unitPrice(isWeekend);
            prices.add(new BgmAgitReservationResponse.PriceByDate(d, price, isWeekend));
        }

        // 5. 슬롯 정책(후보 시간대 / 선택 제한 / 예약 타입) — 프론트가 하드코딩 대신 이걸 쓴다
        List<BgmAgitReservationResponse.SlotRange> slotRanges = SlotSchedule.of(mahjong, today)
                .slots()
                .stream()
                .map(slot -> new BgmAgitReservationResponse.SlotRange(
                        slot.start().format(HH_MM),
                        slot.end().format(HH_MM)))
                .toList();

        // 룸은 인원이 정해져야 총액이 나오므로 여기서는 방식만 알려주고 금액은 prices 의 단가로 조립하게 한다.
        // 마작 대탁만 예전처럼 방당 정액을 합산해 확정 금액을 내려준다.
        Integer depositAmount = mahjong
                ? SlotSchedule.totalPaymentAmount(rooms, 0, false)
                : null;

        return new BgmAgitReservationResponse(
                timeSlots, prices, label, group, minPeople, maxPeople,
                slotRanges,
                SlotSchedule.maxSelectableSlots(mahjong),
                SlotSchedule.resolveReservationType(mahjong).name(),
                mahjong ? "FLAT" : "PER_PERSON",
                depositAmount
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AvailableRoomsResponse getAvailableRooms(Long labelGb, String link, LocalDate date) {
        // 예약 캘린더(getReservation)와 같은 방식으로 로그인 사용자를 읽는다.
        // 안 읽으면 "내 대기건"이 점유로 안 잡혀서, 방을 눌렀을 때 캘린더에 뜨는 시간 수와 배지 숫자가 어긋난다.
        Long userId = currentUserIdOrNull();
        LocalDate now = LocalDate.now(KST);

        // 방 카드 목록(GET /rooms)과 같은 필터여야 배지가 빠지는 카드가 안 생긴다
        List<BgmAgitRoom> rooms = bgmAgitRoomRepository.findVisibleByLink(link);

        String blockedMessage = resolveDateBlockMessage(date, now);
        if (blockedMessage != null) {
            // 날짜 자체가 불가면 예약을 조회할 이유가 없다.
            List<AvailableRoomsResponse.Room> blockedRooms = rooms.stream()
                    .map(room -> toAvailableRoom(room, date, List.of(), blockedMessage))
                    .toList();
            return new AvailableRoomsResponse(date, true, blockedMessage,
                    SlotSchedule.closedWeekdayForJs(), blockedRooms);
        }

        List<Long> roomIds = rooms.stream().map(BgmAgitRoom::getBgmAgitRoomId).toList();
        Map<Long, List<ReservedTimeDto>> reservedByRoom =
                bgmAgitReservationRepository.findReservedTimesByRoomIdsAndDate(roomIds, date);

        List<AvailableRoomsResponse.Room> result = new ArrayList<>();
        for (BgmAgitRoom room : rooms) {
            Map<LocalDate, List<TimeRange>> reservedMap = ReservedTimeDto.groupedReservation(
                    reservedByRoom.getOrDefault(room.getBgmAgitRoomId(), List.of()));
            // 판정은 예약 캘린더와 같은 메서드를 탄다. 여기서 따로 구현하면 두 화면의 숫자가 갈린다.
            DayAvailability availability = resolveDayAvailability(room, reservedMap, date, now, userId);
            result.add(toAvailableRoom(room, date, availability.slots(), availability.message()));
        }

        return new AvailableRoomsResponse(date, false, null, SlotSchedule.closedWeekdayForJs(), result);
    }

    /**
     * 그 날짜 전체가 예약 불가인 사유. 가능한 날짜면 null.
     * 문구는 조회(getReservation)·등록(createReservation)에서 쓰던 것을 그대로 재사용한다.
     */
    private String resolveDateBlockMessage(LocalDate date, LocalDate now) {
        if (date.isEqual(now)) {
            return "당일 예약은 불가능합니다.";
        }
        // 아직 열지 않은 기간(개편 오픈 전 11월 이후)은 기간 초과와 사유가 달라 먼저 걸러 문구를 따로 준다.
        if (SlotSchedule.isBlockedDate(date)) {
            return SlotSchedule.RESERVATION_BLOCKED_MESSAGE;
        }
        if (!SlotSchedule.isWithinReservableWindow(date, now)) {
            return "예약은 내일부터 " + SlotSchedule.RESERVATION_WINDOW_MONTHS + "개월 이내의 날짜만 가능합니다.";
        }
        if (SlotSchedule.isClosedDay(date)) {
            return SlotSchedule.CLOSED_DAY_MESSAGE;
        }
        return null;
    }

    private AvailableRoomsResponse.Room toAvailableRoom(BgmAgitRoom room,
                                                        LocalDate date,
                                                        List<String> availableSlots,
                                                        String message) {
        int totalSlotCount = SlotSchedule.of(room, date).slots().size();
        return new AvailableRoomsResponse.Room(
                room.getBgmAgitRoomId(),
                room.getBgmAgitRoomName(),
                room.getBgmAgitRoomGuide(),
                categoryOf(room),
                room.getBgmAgitRoomMinPeople(),
                room.getBgmAgitRoomMaxPeople(),
                totalSlotCount,
                availableSlots.size(),
                !availableSlots.isEmpty(),
                message
        );
    }

    /** 프론트 탭·배지 분류값. 카테고리 컬럼이 없어 메뉴 링크로 판정한다. */
    private static String categoryOf(BgmAgitRoom room) {
        return room.isMahjong() ? "MAHJONG" : "ROOM";
    }

    /** 로그인 상태면 회원 id, 비로그인이면 null. 예약 조회는 비로그인도 허용된다. */
    private Long currentUserIdOrNull() {
        Authentication authentication = SecurityContextHolder.getContextHolderStrategy().getContext().getAuthentication();
        return (authentication instanceof JwtAuthenticationToken bearerAuth)
                ? ((Jwt) bearerAuth.getPrincipal()).getClaim("id")
                : null;
    }

    @Override
    public ApiResponse createReservation(BgmAgitReservationCreateRequest request, Long userId) {
        // 합쳐 예약(예: M-1 + M-2)이면 방이 여러 개. 첫 번째가 기준 방
        List<BgmAgitRoom> rooms = loadReservableRooms(mergeRoomIds(request.getRoomId(), request.getRoomIds()));
        boolean mahjong = rooms.get(0).isMahjong();
        Integer people = request.getBgmAgitReservationPeople();
        String reservationRequest = !StringUtils.hasText(request.getBgmAgitReservationRequest()) ? "없음" : request.getBgmAgitReservationRequest();

        // 인원이 곧 결제 금액이므로 서버가 범위를 직접 검증한다.
        // 프론트 스테퍼만 믿으면 people=1 로 POST 해서 7인 룸을 1인 요금에 잡을 수 있다.
        validateReservationPeople(rooms, people);

        // 날짜 보정
        LocalDate kstDate = ZonedDateTime
                .parse(request.getBgmAgitReservationStartDate())
                .withZoneSameInstant(KST)
                .toLocalDate();

        // 예약 가능 기간: 당일·과거 불가 + 현재일 기준 RESERVATION_WINDOW_MONTHS 개월 이내.
        // 조회(getReservation)에서 슬롯을 안 내려주는 것만으로는 직접 POST 를 막지 못하므로 등록에서도 검증한다.
        LocalDate kstToday = LocalDate.now(KST);
        // 아직 열지 않은 기간(개편 오픈 전 11월 이후)은 기간 초과와 사유가 달라 먼저 걸러 문구를 따로 준다.
        if (SlotSchedule.isBlockedDate(kstDate)) {
            throw new ReservationConflictException(SlotSchedule.RESERVATION_BLOCKED_MESSAGE);
        }
        if (!SlotSchedule.isWithinReservableWindow(kstDate, kstToday)) {
            throw new ReservationConflictException(
                    "예약은 내일부터 " + SlotSchedule.RESERVATION_WINDOW_MONTHS + "개월 이내의 날짜만 가능합니다.");
        }

        // 수요일은 무인운영으로 예약 불가
        if (SlotSchedule.isClosedDay(kstDate)) {
            throw new ReservationConflictException(SlotSchedule.CLOSED_DAY_MESSAGE);
        }

        // 시간: 이어진 한 구간. 프론트도 막지만 직접 POST 를 막는 건 서버다.
        SlotSchedule schedule = SlotSchedule.of(mahjong, kstDate);
        Set<LocalTime> requestedStartTimes = parseStartTimes(request.getStartTimeEndTime());
        validateSelectedSlots(schedule, requestedStartTimes);
        SlotSchedule.Slot span = schedule.span(requestedStartTimes);

        // 예약 기본 정보 조회
        BgmAgitMember member = bgmAgitMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        // 방별 구간 겹침 충돌 검사(확정건 + 내 대기건). 캘린더·배지와 같은 TimeRange.isOverlapping 규칙이다.
        // 슬롯 문자열 일치가 아니라 구간 겹침이라 13~17시 위에 15~18시를 거는 일부 겹침도 막힌다.
        Map<Long, List<ReservedTimeDto>> reservedByRoom = bgmAgitReservationRepository.findReservedTimesByRoomIdsAndDate(
                rooms.stream().map(BgmAgitRoom::getBgmAgitRoomId).toList(), kstDate);
        for (BgmAgitRoom room : rooms) {
            boolean conflict = reservedByRoom.getOrDefault(room.getBgmAgitRoomId(), List.of()).stream()
                    .map(ReservedTimeDto::toTimeRange)
                    .anyMatch(r -> r.isOverlapping(span.start(), span.end(), userId));
            if (conflict) {
                throw new ReservationConflictException(
                        room.getBgmAgitRoomName() + " 이미 예약된 시간대입니다: "
                                + span.start().format(HH_MM) + " ~ " + span.end().format(HH_MM));
            }
        }

        // 예약 1건(구간 하나) + 방 수만큼 예약방 행. 예약 타입은 클라이언트 값이 아니라 방으로 서버가 결정
        BgmAgitReservation reservation = new BgmAgitReservation(
                member,
                SlotSchedule.resolveReservationType(mahjong),
                kstDate,
                span.start().toLocalTime(),
                span.end().toLocalTime(),
                people,
                reservationRequest
        );
        rooms.forEach(reservation::addRoom);
        bgmAgitReservationRepository.save(reservation);

        eventPublisher.publishEvent(new ReservationWaitingEvent(member, reservation));
        return new ApiResponse(200, true, "예약이 완료되었습니다.");
    }

    /** "HH:mm" 목록 → 시작시각 집합. 형식이 틀리면 400. */
    private Set<LocalTime> parseStartTimes(List<String> startTimes) {
        if (startTimes == null || startTimes.isEmpty()) {
            throw new ValidException("예약 시간을 선택해 주세요.");
        }
        Set<LocalTime> result = new LinkedHashSet<>();
        for (String value : startTimes) {
            try {
                result.add(LocalTime.parse(value.trim(), HH_MM));
            } catch (RuntimeException e) {
                throw new ValidException("잘못된 시간 형식입니다: " + value);
            }
        }
        return result;
    }

    /**
     * 선택 슬롯 검증 — 연속 구간.
     * 떨어진 시간대를 받으면 사이 시간이 비어 보이면서 실제로는 못 쓰는 방이 되고,
     * 예약 1건 = 한 구간이라는 저장 구조와도 맞지 않는다.
     */
    static void validateSelectedSlots(SlotSchedule schedule, Collection<LocalTime> startTimes) {
        if (!schedule.isContiguous(startTimes)) {
            throw new ValidException(NOT_CONTIGUOUS_MESSAGE);
        }
    }

    @Override
    public PaymentOrderResponse createPaymentOrder(Long reservationId, Long userId) {
        BgmAgitReservation reservation = bgmAgitReservationRepository.findReservationWithRooms(reservationId)
                .orElseThrow(() -> new ReservationConflictException("존재하지 않는 예약입니다."));

        // 소유자 검증: 본인 예약만 결제 가능
        if (!Objects.equals(reservation.getMemberId(), userId)) {
            throw new ReservationConflictException("본인의 예약이 아닙니다.");
        }
        // 취소된 예약은 결제 불가
        if (reservation.isCanceled()) {
            throw new ReservationConflictException("취소된 예약입니다.");
        }
        // 이미 확정(결제완료)된 예약은 재결제 불가
        if (reservation.isApproved()) {
            throw new ReservationConflictException("이미 확정된 예약입니다.");
        }

        // 이미 지난 예약은 결제 불가. 없으면 끝난 예약에 전액을 결제하고 환불은 0%가 되는 조합이 만들어진다
        LocalDateTime useStartAt = reservation.getUseStartAt();
        if (useStartAt != null && !useStartAt.isAfter(LocalDateTime.now(KST))) {
            throw new ReservationConflictException("이미 시작된 예약은 결제할 수 없습니다.");
        }

        // 금액 서버 계산 — 저장된 인원과 예약일로 다시 구한다(클라이언트 금액 불신).
        // 예약 대기 알림톡의 금액 안내도 같은 메서드를 쓰므로 여기서 갈라지지 않게 할 것
        List<BgmAgitRoom> rooms = reservation.getRoomList();
        Integer people = reservation.getBgmAgitReservationPeople();
        validateReservationPeople(rooms, people);

        LocalDate reservationDate = reservation.getBgmAgitReservationStartDate();
        boolean weekendRate = bgmAgitHolidayService.isWeekendRate(reservationDate);
        int amount = SlotSchedule.totalPaymentAmount(rooms, people, weekendRate);
        String orderName = "BGM아지트 예약 - " + reservationDate;

        // 인원·단가를 결제행에 박아 둔다. 환불은 결제 시점 기준으로 계산해야 하는데
        // 예약의 인원은 뒤에 바뀔 수 있어서 그때 가서는 복원할 수 없다
        Integer unitPrice = reservation.isMahjong()
                ? null
                : SlotSchedule.unitPrice(weekendRate);

        // 공통 결제 모듈에 주문 생성 위임
        return paymentService.createOrder(userId, reservationId, amount, orderName, people, unitPrice);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupedReservationResponse> getReservationDetail(Long memberId, List<String> roles, String startDate, String endDate, Pageable pageable) {

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate start = StringUtils.hasText(startDate) ? LocalDate.parse(startDate, fmt) : null;
        LocalDate end   = StringUtils.hasText(endDate)   ? LocalDate.parse(endDate, fmt)   : null;
        // 본인 예약만 볼지 전체를 볼지. **관리자일 때만** 전체를 연다.
        //
        // 예전에는 "ROLE_USER 이거나 ROLE_MENTOR 이면 본인 것만"이라는 블랙리스트였다.
        // isUserFilter 는 false 면 where 절을 아예 안 걸기 때문에, 역할이 그 둘이 아니기만 하면
        // (역할 추가, roles 클레임이 빈 토큰 → "GUEST") 전 회원 예약이 통째로 내려갔다.
        // 이 응답에는 이름·전화번호·요청사항·영수증 URL·결제 잔액이 들어 있다.
        boolean isUser = !isAdmin(roles);

        // 예약 1건 = 1행이라 부모 그대로 페이징한다(방은 같은 페이지 id 로 fetch)
        Page<BgmAgitReservation> page = bgmAgitReservationRepository
                .findReservationPageForDetail(memberId, isUser, start, end, pageable);
        if (page.getContent().isEmpty()) {
            return new PageImpl<>(new ArrayList<>(), pageable, page.getTotalElements());
        }

        List<Long> pageIds = page.getContent().stream().map(BgmAgitReservation::getBgmAgitReservationId).toList();
        // 결제 완료건 영수증 URL 배치 조회 (예약별 최신 결제)
        Map<Long, String> receiptUrls = bgmAgitPaymentRepository.findDoneReceiptUrlsByReservationIds(pageIds);
        // 환불 예상액 계산에 쓸 결제 잔액 배치 조회
        Map<Long, Integer> paidAmounts = bgmAgitPaymentRepository.findPaidAmountsByReservationIds(pageIds);

        LocalDateTime now = LocalDateTime.now(KST);

        List<GroupedReservationResponse> content = new ArrayList<>();
        for (BgmAgitReservation reservation : page.getContent()) {
            Long reservationId = reservation.getBgmAgitReservationId();
            GroupedReservationResponse dto = new GroupedReservationResponse(reservation);
            dto.setReceiptUrl(receiptUrls.get(reservationId));

            int paid = paidAmounts.getOrDefault(reservationId, 0);
            int rate = ReservationRefundPolicy.refundRate(reservation.getUseStartAt(), now);
            dto.setPaidAmount(paid);
            dto.setRefundRate(rate);
            dto.setRefundAmount(ReservationRefundPolicy.refundAmount(paid, rate));
            content.add(dto);
        }

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminReservationBoardResponse getReservationBoard(LocalDate date, List<String> roles) {

        if (!isAdmin(roles)) {
            throw new ValidException("관리자만 조회할 수 있습니다.");
        }

        List<BgmAgitReservation> reservations = bgmAgitReservationRepository.findReservationsByDate(date);

        Map<Long, String> receiptUrls = bgmAgitPaymentRepository.findDoneReceiptUrlsByReservationIds(
                reservations.stream().map(BgmAgitReservation::getBgmAgitReservationId).toList());

        Map<String, List<AdminReservationBoardResponse.Item>> byRoom = new LinkedHashMap<>();
        // 예약 장소 → ROOM / MAHJONG. 프론트 탭 분류용
        Map<String, String> roomCategories = new LinkedHashMap<>();
        int confirmed = 0;
        int waiting = 0;
        int canceled = 0;
        int people = 0;

        for (BgmAgitReservation reservation : reservations) {
            boolean isCanceled = reservation.isCanceled();
            boolean isConfirmed = !isCanceled && reservation.isApproved();

            if (isCanceled) {
                canceled++;
            } else if (isConfirmed) {
                confirmed++;
            } else {
                waiting++;
            }
            if (!isCanceled && reservation.getBgmAgitReservationPeople() != null) {
                people += reservation.getBgmAgitReservationPeople();
            }

            // 합쳐 예약은 방이 여러 개라 각 장소 열에 같은 항목을 넣는다.
            Map<String, String> roomsOfReservation = new LinkedHashMap<>();
            for (BgmAgitRoom room : reservation.getRoomList()) {
                String name = StringUtils.hasText(room.getBgmAgitRoomName()) ? room.getBgmAgitRoomName() : "기타";
                roomsOfReservation.putIfAbsent(name, categoryOf(room));
            }
            if (roomsOfReservation.isEmpty()) {
                roomsOfReservation.put("기타", null);
            }
            List<String> roomNames = roomsOfReservation.keySet().stream().sorted().toList();

            int startMinutes = SlotSchedule.toSortableMinutes(reservation.getBgmAgitReservationStartTime());
            int endMinutes = SlotSchedule.toSortableMinutes(reservation.getBgmAgitReservationEndTime());
            // 종료가 시작보다 같거나 이르면 익일 같은 시각까지다(룸 하루 전체 10:00~10:00 등)
            if (endMinutes <= startMinutes) {
                endMinutes += 24 * 60;
            }

            BgmAgitMember member = reservation.getBgmAgitMember();
            AdminReservationBoardResponse.Item item = new AdminReservationBoardResponse.Item(
                    reservation.getBgmAgitReservationId(),
                    roomNames,
                    member != null ? member.getBgmAgitMemberName() : null,
                    extractPhoneNo(member),
                    reservation.getBgmAgitReservationPeople(),
                    reservation.getBgmAgitReservationRequest(),
                    reservation.getBgmAgitReservationApprovalStatus(),
                    reservation.getBgmAgitReservationCancelStatus(),
                    receiptUrls.get(reservation.getBgmAgitReservationId()),
                    reservation.getRegistDate(),
                    formatTime(reservation.getBgmAgitReservationStartTime()),
                    formatTime(reservation.getBgmAgitReservationEndTime()),
                    startMinutes,
                    endMinutes
            );

            roomsOfReservation.forEach((roomKey, category) -> {
                byRoom.computeIfAbsent(roomKey, key -> new ArrayList<>()).add(item);
                if (category != null) {
                    roomCategories.putIfAbsent(roomKey, category);
                }
            });
        }

        List<AdminReservationBoardResponse.Room> roomList = byRoom.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    List<AdminReservationBoardResponse.Item> items = new ArrayList<>(e.getValue());
                    items.sort(Comparator.comparingInt(AdminReservationBoardResponse.Item::getStartMinutes));
                    return new AdminReservationBoardResponse.Room(e.getKey(), roomCategories.get(e.getKey()), items);
                })
                .toList();

        AdminReservationBoardResponse.Summary summary =
                new AdminReservationBoardResponse.Summary(confirmed + waiting, confirmed, waiting, canceled, people);

        return new AdminReservationBoardResponse(date, summary, roomList);
    }

    private String formatTime(LocalTime time) {
        return time != null ? time.format(HH_MM) : null;
    }

    private String extractPhoneNo(BgmAgitMember member) {
        if (member == null || member.getBgmAgitMemberPhoneNo() == null) {
            return null;
        }
        return member.getBgmAgitMemberPhoneNo().replace("+82", "0").replaceAll("\\s+", "");
    }

    @Override
    public ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request, List<String> roles) {

        Long reservationId = request.getReservationId();
        // 상태값은 Y/N 으로 정규화해서 받는다.
        //
        // 게이트는 equalsIgnoreCase 인데 DB 에는 요청 문자열이 그대로 들어가고 판독은 "Y".equals 라
        // 대소문자가 갈렸다. cancelStatus="y" 로 보내면 환불은 집행되는데 DB 에는 'y' 가 남아
        // 예약내역·현황판·결제 검증이 모두 "취소 아님"으로 봤다 — 환불받고 자리는 유지되는 상태.
        String cancelStatus = normalizeYn(request.getCancelStatus());
        String approvalStatus = normalizeYn(request.getApprovalStatus());

        BgmAgitReservation reservation = bgmAgitReservationRepository.findReservationWithRooms(reservationId)
                .orElseThrow(() -> new ReservationConflictException("존재하지 않는 예약입니다."));

        boolean admin = isAdmin(roles);
        boolean canceling = "Y".equals(cancelStatus);

        // 손님이 이 API 로 할 수 있는 일은 "본인 예약 취소" 하나뿐이다.
        //
        // 예전에는 상태 검증이 취소 분기에만 있어서, 프론트가 숨긴 동작을 API 직접 호출로 전부 할 수 있었다.
        //  - approvalStatus='Y'  → 결제 없이 확정(예약금 1만원 시절과 달리 지금은 한 건에 수만 원이다)
        //  - cancelStatus='N'    → 이미 환불받은 예약을 되살리기(돈은 돌려받고 자리는 그대로)
        //  - 남의 예약번호       → 소유자 검증이 취소 분기 안에만 있어 그대로 통과
        // 관리자가 남의 예약을 확정·취소하는 것은 전화·현장 예약 대응이라 의도된 동작이므로 그대로 둔다.
        if (!admin) {
            if ("Y".equals(approvalStatus)) {
                throw new ReservationConflictException("예약 확정은 관리자만 할 수 있습니다. 결제를 완료하시면 자동으로 확정됩니다.");
            }
            if (!canceling) {
                throw new ReservationConflictException("예약 상태를 변경할 수 없습니다. 매장으로 문의해 주세요.");
            }
            validateUserCancelableReservation(id, reservation);
        }

        // 이미 취소된 예약은 여기서 끊는다. 재취소를 막지 않으면 잔액이 남아 있는 결제를 또 환불하게 된다
        // (전액취소 시절엔 토스가 ALREADY_CANCELED_PAYMENT 로 막아줘서 드러나지 않던 구멍이다)
        if (canceling && reservation.isCanceled()) {
            return new ApiResponse(200, true, "이미 취소된 예약입니다.");
        }

        PaymentRefundResult refund = null;
        if (canceling) {
            // 환불 비율은 이용 시작 시각 기준 48h/24h. 관리자 취소도 같은 규칙을 쓴다
            int rate = ReservationRefundPolicy.refundRate(reservation.getUseStartAt(), LocalDateTime.now(KST));
            refund = paymentService.refundReservation(reservationId, rate, "예약 취소");
            // 승인되지 않은 주문이 남아 있으면 취소 뒤에 결제되는 일이 생긴다
            paymentService.abortReadyOrders(reservationId, "예약 취소됨");
        }

        // 변경 전 확정 여부를 상태 변경보다 먼저 읽는다(예전 findBizTalkCancel 을 업데이트 전에 읽던 순서).
        // 뒤에서 읽으면 이미 'Y' 로 바뀐 값이라 "대기 → 확정" 전환을 알아보지 못해 확정 알림톡이 안 나간다.
        boolean wasPending = !reservation.isApproved();

        // 1건 = 1행이라 벌크 업데이트 없이 더티체킹으로 반영한다
        reservation.changeStatus(cancelStatus, approvalStatus);

        // 알림톡 쪽은 role 문자열을 "ROLE_ADMIN" 인지만 비교하므로 판정 결과를 그대로 넘긴다.
        // 예전엔 JWT roles 의 첫 값을 그대로 썼는데, 관리자에게 USER 권한이 같이 있으면
        // 첫 값이 ROLE_USER 로 나와 관리자 취소가 사용자 취소 문구로 나갈 수 있었다.
        ReservationTalkContext ctx = ReservationTalkContext.of(admin ? "ROLE_ADMIN" : "ROLE_USER", reservation);

        boolean approvedNow = "Y".equals(approvalStatus);

        TalkAction action = TalkAction.NONE;
        if (approvedNow && wasPending) {
            action = TalkAction.COMPLETE;
        } else if (canceling) {
            action = TalkAction.CANCEL;
        }

        if (action != TalkAction.NONE) {
            eventPublisher.publishEvent(new ReservationTalkEvent(action, ctx));
        }

        return new ApiResponse(200, true, refundMessage(refund));
    }

    @Override
    public ApiResponse modifyReservationPeople(Long userId, BgmAgitReservationPeopleRequest request, List<String> roles) {
        Long reservationId = request.getReservationId();
        Integer newPeople = request.getPeople();

        BgmAgitReservation reservation = bgmAgitReservationRepository.findReservationWithRooms(reservationId)
                .orElseThrow(() -> new ReservationConflictException("존재하지 않는 예약입니다."));

        if (!isAdmin(roles) && !Objects.equals(reservation.getMemberId(), userId)) {
            throw new ReservationConflictException("본인의 예약만 변경할 수 있습니다.");
        }
        if (reservation.isCanceled()) {
            throw new ReservationConflictException("취소된 예약입니다.");
        }

        LocalDateTime useStartAt = reservation.getUseStartAt();
        if (useStartAt != null && !useStartAt.isAfter(LocalDateTime.now(KST))) {
            throw new ReservationConflictException("이미 시작된 예약은 변경할 수 없습니다. 매장으로 문의해 주세요.");
        }

        Integer currentPeople = reservation.getBgmAgitReservationPeople();
        if (currentPeople == null) {
            throw new ReservationConflictException("예약 인원 정보가 없어 변경할 수 없습니다. 매장으로 문의해 주세요.");
        }
        if (newPeople == null || newPeople.equals(currentPeople)) {
            return new ApiResponse(200, true, "변경할 내용이 없습니다.");
        }
        // 증원은 받지 않는다. 룸 정원·다른 예약까지 다시 봐야 해서 결제만 더 받는 걸로 끝나지 않는다
        if (newPeople > currentPeople) {
            throw new ReservationConflictException(
                    "예약 인원은 줄일 수만 있습니다. 추가 인원은 현장에서 워크인 요금으로 결제해 주세요.");
        }

        validateReservationPeople(reservation.getRoomList(), newPeople);

        PaymentRefundResult refund = null;
        if (reservation.isApproved()) {
            int rate = ReservationRefundPolicy.refundRate(useStartAt, LocalDateTime.now(KST));
            refund = paymentService.refundPeopleReduction(
                    reservationId, currentPeople - newPeople, rate, "예약 인원 축소");
        } else {
            // 미결제 대기건은 환불할 게 없다. 다만 옛 인원으로 만들어 둔 주문은 못 쓰게 막아야 한다
            paymentService.abortReadyOrders(reservationId, "예약 인원 변경");
        }

        reservation.changePeople(newPeople);

        return new ApiResponse(200, true, peopleChangeMessage(newPeople, refund));
    }

    private String peopleChangeMessage(Integer newPeople, PaymentRefundResult refund) {
        String base = "예약 인원이 " + newPeople + "명으로 변경되었습니다.";
        if (refund == null) {
            return base + " 결제 시 변경된 인원으로 금액이 계산됩니다.";
        }
        if (refund.failed()) {
            return base + " 환불 처리 중 문제가 있어 확인 후 안내드리겠습니다. (" + refund.failMessage() + ")";
        }
        if (refund.refundedAmount() <= 0) {
            return base + " 환불 규정에 따라 환불 금액은 없습니다.";
        }
        return base + " " + String.format("%,d", refund.refundedAmount()) + "원이 환불됩니다.";
    }

    /** 기준 방 + 합쳐 쓸 방을 중복 없이 합친다(기준 방이 항상 첫 번째). */
    private List<Long> mergeRoomIds(Long id, List<Long> extraIds) {
        List<Long> merged = new ArrayList<>();
        merged.add(id);
        if (extraIds != null) {
            extraIds.stream()
                    .filter(Objects::nonNull)
                    .filter(extraId -> !merged.contains(extraId))
                    .forEach(merged::add);
        }
        return merged;
    }

    /**
     * 예약 가능한 방들을 조회하고 합쳐 쓸 수 있는 조합인지 검증한다.
     * 같은 메뉴 링크(룸끼리 / 마작끼리)여야 하고, 이름 조합이 화이트리스트(SlotSchedule.isCombinable)에 있어야 한다.
     *
     * "maxSelectableSlots == null 인 방만 합칠 수 있다"던 옛 규칙은 쓰지 않는다. 지금은 모든 룸이
     * 8시간 상한(=null 아님)이라 그 규칙을 적용하면 M-1+M-2 도 막힌다. 그래서 허용 조합을 서버가 직접 들고 있다.
     */
    private List<BgmAgitRoom> loadReservableRooms(List<Long> roomIds) {
        List<BgmAgitRoom> rooms = new ArrayList<>();
        for (Long roomId : roomIds) {
            if (roomId == null) {
                throw new ValidException("방을 선택해 주세요.");
            }
            BgmAgitRoom room = bgmAgitRoomRepository.findById(roomId)
                    .orElseThrow(() -> new ReservationConflictException("존재하지 않는 방입니다."));
            if (room.isHidden()) {
                throw new ReservationConflictException("예약이 종료된 항목입니다.");
            }
            rooms.add(room);
        }

        if (rooms.size() > 1) {
            BgmAgitRoom primary = rooms.get(0);
            for (BgmAgitRoom room : rooms) {
                if (!Objects.equals(room.getBgmAgitRoomLink(), primary.getBgmAgitRoomLink())) {
                    throw new ReservationConflictException("함께 예약할 수 없는 항목입니다.");
                }
            }
            List<String> names = rooms.stream().map(BgmAgitRoom::getBgmAgitRoomName).toList();
            if (!SlotSchedule.isCombinable(names)) {
                throw new ReservationConflictException("함께 예약할 수 없는 항목입니다.");
            }
        }
        return rooms;
    }

    /** 방 하나의 특정 날짜 예약 가능 시간대. message 가 있으면 그 날짜는 전체 불가. */
    private DayAvailability resolveDayAvailability(BgmAgitRoom room,
                                                  Map<LocalDate, List<TimeRange>> reservedMap,
                                                  LocalDate d,
                                                  LocalDate today,
                                                  Long userId) {
        List<TimeRange> reserved = reservedMap.getOrDefault(d, Collections.emptyList());

        List<String> availableSlots = new ArrayList<>();
        for (SlotSchedule.Slot slot : SlotSchedule.of(room, d).slots()) {
            if (d.isEqual(today) && slot.end().isBefore(LocalDateTime.now(KST))) {
                continue;
            }
            // 예약은 구간으로 저장되므로 슬롯과 구간이 겹치는지로 점유를 판정한다(확정건 + 내 대기건)
            boolean overlapped = reserved.stream()
                    .anyMatch(r -> r.isOverlapping(slot.start(), slot.end(), userId));
            if (!overlapped) {
                availableSlots.add(slot.start().format(HH_MM));
            }
        }
        return new DayAvailability(availableSlots, null);
    }

    private record DayAvailability(List<String> slots, String message) {
    }

    /**
     * 취소 결과 안내 문구.
     *
     * 환불액은 목록에 미리 보여준 예상액이 아니라 **실제 처리된 금액**을 쓴다.
     * 48시간 경계를 목록을 열어둔 채 넘기면 예상액과 실제액이 갈리기 때문이다.
     */
    private String refundMessage(PaymentRefundResult refund) {
        if (refund == null) {
            return "수정 되었습니다.";
        }
        if (refund.failed()) {
            return "예약이 취소되었습니다. 환불 처리 중 문제가 있어 확인 후 안내드리겠습니다. (" + refund.failMessage() + ")";
        }
        if (refund.refundedAmount() <= 0) {
            return "예약이 취소되었습니다. 환불 규정에 따라 환불 금액은 없습니다.";
        }
        return "예약이 취소되었습니다. " + String.format("%,d", refund.refundedAmount()) + "원이 환불됩니다.";
    }

    /**
     * 합쳐 예약의 최소 인원 — 각 방 최소값 중 가장 큰 값.
     * 조회 응답(minPeople)과 등록 검증이 같은 규칙을 봐야 화면에서 고를 수 있는 값이 서버에서 거절되지 않는다.
     */
    private Integer effectiveMinPeople(List<BgmAgitRoom> rooms) {
        return rooms.stream()
                .map(BgmAgitRoom::getBgmAgitRoomMinPeople)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(null);
    }

    /** 합쳐 예약의 최대 인원 — 방별 최대값 합산. 값이 하나도 없으면 null(=제한 없음). */
    private Integer effectiveMaxPeople(List<BgmAgitRoom> rooms) {
        List<Integer> maxima = rooms.stream()
                .map(BgmAgitRoom::getBgmAgitRoomMaxPeople)
                .filter(Objects::nonNull)
                .toList();
        return maxima.isEmpty() ? null : maxima.stream().reduce(0, Integer::sum);
    }

    /** 예약 인원이 방의 허용 범위 안인지. 컬럼이 비어 있는 방은 그 방향 검증을 건너뛴다. */
    private void validateReservationPeople(List<BgmAgitRoom> rooms, Integer people) {
        if (people == null || people < 1) {
            throw new ReservationConflictException("예약 인원을 입력해 주세요.");
        }
        Integer min = effectiveMinPeople(rooms);
        Integer max = effectiveMaxPeople(rooms);
        if (min != null && people < min) {
            throw new ReservationConflictException("최소 " + min + "명부터 예약할 수 있습니다.");
        }
        if (max != null && people > max) {
            throw new ReservationConflictException("최대 " + max + "명까지 예약할 수 있습니다.");
        }
    }

    private void validateUserCancelableReservation(Long memberId, BgmAgitReservation reservation) {
        if (!Objects.equals(reservation.getMemberId(), memberId)) {
            throw new ReservationConflictException("본인의 예약만 취소할 수 있습니다.");
        }

        // 기한 제한은 날짜가 아니라 시각으로 본다. 24시간 이내 취소도 허용하고 환불만 0원이다
        // (자리를 비워주는 쪽이 매장에 이득이라 막지 않는다). 이미 시작된 예약만 거절한다.
        LocalDateTime useStartAt = reservation.getUseStartAt();
        if (useStartAt != null && !useStartAt.isAfter(LocalDateTime.now(KST))) {
            throw new ReservationConflictException("이미 시작된 예약은 취소할 수 없습니다. 매장으로 문의해 주세요.");
        }
    }

    /**
     * Y/N 상태값 정규화. 그 외 값은 거절한다.
     *
     * 예전에는 요청 문자열이 검증 없이 컬럼에 그대로 들어가서, 대소문자가 다르거나 아예 엉뚱한 값도
     * 저장됐다. 판독하는 쪽은 전부 `"Y".equals` 라 조용히 어긋난다.
     */
    private String normalizeYn(String value) {
        if ("Y".equalsIgnoreCase(value)) {
            return "Y";
        }
        if ("N".equalsIgnoreCase(value)) {
            return "N";
        }
        throw new ReservationConflictException("잘못된 예약 상태값입니다.");
    }

    private boolean isAdmin(List<String> roles) {
        if (roles == null) {
            return false;
        }
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }
}
