package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.origin.controller.response.reservation.AdminReservationBoardResponse;
import com.bgmagitapi.origin.controller.response.reservation.AvailableRoomsResponse;
import com.bgmagitapi.origin.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.controller.response.reservation.TimeRange;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.BgmAgitReservationRoom;
import com.bgmagitapi.origin.entity.BgmAgitRoom;
import com.bgmagitapi.origin.event.dto.ReservationTalkEvent;
import com.bgmagitapi.origin.event.dto.ReservationWaitingEvent;
import com.bgmagitapi.origin.event.dto.TalkAction;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.repository.BgmAgitRoomRepository;
import com.bgmagitapi.origin.service.BgmAgitReservationService;
import com.bgmagitapi.origin.service.response.BizTalkCancel;
import com.bgmagitapi.origin.service.response.ReservationTalkContext;
import com.bgmagitapi.origin.util.LunarCalendar;
import com.bgmagitapi.origin.util.SlotSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
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
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {

    /** 영업 기준 시간대. 서버 JVM 타임존에 기대지 말고 날짜 판단은 항상 이걸로 한다. */
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HH:mm");

    private final BgmAgitRoomRepository bgmAgitRoomRepository;

    private final BgmAgitMemberRepository bgmAgitMemberRepository;

    private final BgmAgitReservationRepository bgmAgitReservationRepository;

    private final ApplicationEventPublisher eventPublisher;

    private final PaymentService paymentService;

    private final BgmAgitPaymentRepository bgmAgitPaymentRepository;

    @Override
    @Transactional(readOnly = true)
    public BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id, LocalDate date) {
        return getReservation(labelGb, link, id, null, date);
    }

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
        // 1. 대상 방 조회 (첫 번째가 기준 방, 나머지는 합쳐 쓸 방). id/ids 파라미터 값은 roomId 다
        List<BgmAgitRoom> rooms = loadReservableRooms(mergeRoomIds(id, extraIds));
        BgmAgitRoom primary = rooms.get(0);
        // 항목 정보는 방 기준으로 1회 세팅 (전 기간 만실이어도 제목/인원이 비지 않게)
        String label = rooms.stream()
                .map(BgmAgitRoom::getBgmAgitRoomName)
                .collect(Collectors.joining(", "));
        String group = primary.getBgmAgitRoomGuide();
        // 합쳐 쓸 때 최소인원은 가장 큰 최소값, 최대인원은 합산
        Integer minPeople = rooms.stream()
                .map(BgmAgitRoom::getBgmAgitRoomMinPeople)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(null);
        Integer maxPeople = rooms.stream()
                .map(BgmAgitRoom::getBgmAgitRoomMaxPeople)
                .filter(Objects::nonNull)
                .reduce(0, Integer::sum);

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

        // 4. 공휴일/주말 가격 계산
        Set<String> holidaySet = new HashSet<>();

        int startYear = today.getYear();
        int endYear = endOfWindow.getYear();

        for (int y = startYear; y <= endYear; y++) {
            holidaySet.addAll(new LunarCalendar().getHolidaySet(String.valueOf(y)));
        }

        DateTimeFormatter formatterYY = DateTimeFormatter.ofPattern("yyyyMMdd");

        List<BgmAgitReservationResponse.PriceByDate> prices = new ArrayList<>();

        for (LocalDate d = today; !d.isAfter(endOfWindow); d = d.plusDays(1)) {
            if (d.isEqual(now)) {
                continue;
            }
            String dateStr = d.format(formatterYY);
            boolean isWeekend = d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean isHoliday = holidaySet.contains(dateStr);
            int price = (isWeekend || isHoliday) ? 4000 : 3000;
            if (SlotSchedule.isMahjongRental(primary)) {
                price = 40000;
            }
            prices.add(new BgmAgitReservationResponse.PriceByDate(d, price, isWeekend || isHoliday));
        }

        // 5. 슬롯 정책(후보 시간대 / 선택 제한 / 예약 타입) — 프론트가 하드코딩 대신 이걸 쓴다
        List<BgmAgitReservationResponse.SlotRange> slotRanges = SlotSchedule.of(primary, today)
                .slots()
                .stream()
                .map(slot -> new BgmAgitReservationResponse.SlotRange(
                        slot.start().format(HHMM),
                        slot.end().format(HHMM)))
                .toList();

        // 예약금은 방별 합산 (합쳐 예약이면 M-1 + M-2 = 2만원). 결제 주문과 같은 메서드
        int depositAmount = SlotSchedule.totalDepositAmount(rooms);

        return new BgmAgitReservationResponse(
                timeSlots, prices, label, group, minPeople, maxPeople,
                slotRanges,
                SlotSchedule.maxSelectableSlots(primary),
                SlotSchedule.resolveReservationType(primary).name(),
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

        // 방 카드 목록(GET /rooms)과 같은 필터 — 숨김 제외
        List<BgmAgitRoom> rooms = bgmAgitRoomRepository.findReservableRooms(link);

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
                bgmAgitReservationRepository.findReservedTimesByRoomIds(roomIds, date, date);

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

    /** 프론트 탭·카드 구분용 카테고리 문자열. 방 테이블엔 카테고리 컬럼이 없어 링크로 정한다. */
    private String categoryOf(BgmAgitRoom room) {
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
        BgmAgitRoom primary = rooms.get(0);
        Integer people = request.getBgmAgitReservationPeople();
        String reservationRequest = !StringUtils.hasText(request.getBgmAgitReservationRequest()) ? "없음" : request.getBgmAgitReservationRequest();
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

        // 고른 시작 시각 → 그 날의 슬롯. 후보에 없는 시각이 섞이면 거부한다
        List<SlotSchedule.Slot> slots = SlotSchedule.of(primary, kstDate)
                .resolveSlots(parseStartTimes(request.getStartTimeEndTime()));
        if (slots.isEmpty()) {
            throw new ValidException("선택할 수 없는 시간대입니다.");
        }
        // G룸 등 선택 개수 제한(응답의 maxSelectableSlots 는 프론트 안내용이라 직접 POST 는 여기서 막는다)
        Integer maxSelectableSlots = SlotSchedule.maxSelectableSlots(primary);
        if (maxSelectableSlots != null && slots.size() > maxSelectableSlots) {
            throw new ValidException("한 번에 선택할 수 있는 시간대는 " + maxSelectableSlots + "개입니다.");
        }
        // 예약 1건 = 이어진 한 구간. 떨어진 시간대는 담을 수 없으므로 등록에서 막는다(프론트 가드는 안내용)
        if (!SlotSchedule.isContiguous(slots)) {
            throw new ValidException(SlotSchedule.NOT_CONTIGUOUS_MESSAGE);
        }
        SlotSchedule.Slot period = new SlotSchedule.Slot(slots.get(0).start(), slots.get(slots.size() - 1).end());

        // 방별 충돌 검사 — 확정건 + 내 대기건과 구간이 겹치면 거부(조회 화면의 TimeRange.isOverlapping 과 같은 규칙)
        List<Long> roomIds = rooms.stream().map(BgmAgitRoom::getBgmAgitRoomId).toList();
        for (BgmAgitReservationRoom taken : bgmAgitReservationRepository.findActiveReservationRooms(roomIds, kstDate)) {
            BgmAgitReservation other = taken.getBgmAgitReservation();
            boolean blocks = other.isApproved()
                    || Objects.equals(other.getBgmAgitMember().getBgmAgitMemberId(), userId);
            if (blocks && SlotSchedule.overlaps(period, other.getPeriod())) {
                throw new ReservationConflictException(
                        taken.getBgmAgitRoom().getBgmAgitRoomName() + " 이미 예약된 시간대입니다: "
                                + formatTime(other.getBgmAgitReservationStartTime()) + "-"
                                + formatTime(other.getBgmAgitReservationEndTime()));
            }
        }

        // 예약 기본 정보 조회
        BgmAgitMember member = bgmAgitMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        // 예약 1건(첫 슬롯 시작 ~ 마지막 슬롯 종료) + 방 수만큼 예약-방 행(cascade)
        // 예약 타입은 클라이언트 값이 아니라 방 링크로 서버가 결정
        BgmAgitReservation reservation = new BgmAgitReservation(
                member,
                SlotSchedule.resolveReservationType(primary),
                kstDate,
                period.start().toLocalTime(),
                period.end().toLocalTime(),
                people,
                reservationRequest
        );
        rooms.forEach(reservation::addRoom);
        bgmAgitReservationRepository.save(reservation);

        eventPublisher.publishEvent(new ReservationWaitingEvent(member, reservation, rooms));
        return new ApiResponse(200, true, "예약이 완료되었습니다.");
    }

    /** "13:00" 목록 → LocalTime. 형식이 틀리면 400. */
    private List<LocalTime> parseStartTimes(List<String> startTimes) {
        if (startTimes == null || startTimes.isEmpty()) {
            return List.of();
        }
        try {
            return startTimes.stream()
                    .filter(StringUtils::hasText)
                    .map(time -> LocalTime.parse(time.trim(), HHMM))
                    .toList();
        } catch (DateTimeParseException e) {
            throw new ValidException("잘못된 시간 형식입니다.");
        }
    }

    @Override
    public PaymentOrderResponse createPaymentOrder(Long reservationId, Long userId) {
        BgmAgitReservation reservation = bgmAgitReservationRepository.findReservationWithRooms(reservationId)
                .orElseThrow(() -> new ReservationConflictException("존재하지 않는 예약입니다."));

        // 소유자 검증: 본인 예약만 결제 가능
        if (!Objects.equals(reservation.getBgmAgitMember().getBgmAgitMemberId(), userId)) {
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

        // 금액 서버 계산(방당 1만원). 합쳐 예약이면 방 수만큼 합산.
        // 예약 대기 알림톡의 예약금 안내도 같은 메서드를 쓰므로 여기서 갈라지지 않게 할 것
        int amount = SlotSchedule.totalDepositAmount(reservation.getRooms());
        String orderName = "BGM아지트 예약 - " + reservation.getBgmAgitReservationStartDate();

        // 공통 결제 모듈에 주문 생성 위임
        return paymentService.createOrder(userId, reservationId, amount, orderName);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupedReservationResponse> getReservationDetail(Long memberId, String role, String startDate, String endDate, Pageable pageable) {

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate start = StringUtils.hasText(startDate) ? LocalDate.parse(startDate, fmt) : null;
        LocalDate end   = StringUtils.hasText(endDate)   ? LocalDate.parse(endDate, fmt)   : null;
        boolean isUser = "ROLE_USER".equals(role) || "ROLE_MENTOR".equals(role);

        // 예약 1건 = 1행이라 그대로 페이징한다(방은 리포지토리가 같은 컨텍스트로 채워 둔다)
        Page<BgmAgitReservation> page = bgmAgitReservationRepository
                .findReservationPageForDetail(memberId, isUser, start, end, pageable);

        // 결제 완료건 영수증 URL 배치 조회 (예약별 최신 DONE)
        List<Long> ids = page.getContent().stream().map(BgmAgitReservation::getBgmAgitReservationId).toList();
        Map<Long, String> receiptUrls = bgmAgitPaymentRepository.findDoneReceiptUrlsByReservationIds(ids);

        return page.map(reservation -> {
            GroupedReservationResponse dto = new GroupedReservationResponse(reservation);
            dto.setReceiptUrl(receiptUrls.get(reservation.getBgmAgitReservationId()));
            return dto;
        });
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

            // 합쳐 예약은 방마다 같은 항목을 넣는다(M-1+M-2+M-3 이면 세 열 모두에 표시)
            Map<String, String> roomsOfReservation = new LinkedHashMap<>();
            for (BgmAgitRoom room : reservation.getRooms()) {
                String name = StringUtils.hasText(room.getBgmAgitRoomName()) ? room.getBgmAgitRoomName() : "기타";
                roomsOfReservation.putIfAbsent(name, categoryOf(room));
            }
            if (roomsOfReservation.isEmpty()) {
                roomsOfReservation.put("기타", null);
            }
            List<String> roomNames = roomsOfReservation.keySet().stream().sorted().toList();

            AdminReservationBoardResponse.Item item = new AdminReservationBoardResponse.Item(
                    reservation.getBgmAgitReservationId(),
                    roomNames,
                    reservation.getBgmAgitMember() != null ? reservation.getBgmAgitMember().getBgmAgitMemberName() : null,
                    extractPhoneNo(reservation),
                    reservation.getBgmAgitReservationPeople(),
                    reservation.getBgmAgitReservationRequest(),
                    reservation.getBgmAgitReservationApprovalStatus(),
                    reservation.getBgmAgitReservationCancelStatus(),
                    receiptUrls.get(reservation.getBgmAgitReservationId()),
                    reservation.getRegistDate(),
                    formatTime(reservation.getBgmAgitReservationStartTime()),
                    formatTime(reservation.getBgmAgitReservationEndTime()),
                    SlotSchedule.toSortableMinutes(reservation.getBgmAgitReservationStartTime()),
                    SlotSchedule.toSortableMinutes(reservation.getBgmAgitReservationEndTime())
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
        return time != null ? time.format(HHMM) : null;
    }

    private String extractPhoneNo(BgmAgitReservation reservation) {
        if (reservation.getBgmAgitMember() == null) {
            return null;
        }
        String phoneNo = reservation.getBgmAgitMember().getBgmAgitMemberPhoneNo();
        if (phoneNo == null) {
            return null;
        }
        return phoneNo.replace("+82", "0").replaceAll("\\s+", "");
    }

    @Override
    public ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request, String role) {

        Long reservationId = request.getReservationId();
        String cancelStatus = request.getCancelStatus();
        String approvalStatus = request.getApprovalStatus();

        BgmAgitReservation reservation = bgmAgitReservationRepository.findReservationWithRooms(reservationId)
                .orElseThrow(() -> new ReservationConflictException("존재하지 않는 예약입니다."));

        if ("Y".equalsIgnoreCase(cancelStatus) && !isAdmin(role)) {
            validateUserCancelableReservation(id, reservation);
        }

        if ("Y".equalsIgnoreCase(cancelStatus)) {
            paymentService.cancelDonePaymentByReservationId(reservationId, "예약 취소");
        }

        // 상태를 바꾸기 전에 읽는다 — approvalStatus 가 "변경 전" 값이어야 대기→확정 전환을 가려낸다
        BizTalkCancel bizTalkCancel = BizTalkCancel.from(reservation);

        reservation.changeStatus(cancelStatus, approvalStatus);

        ReservationTalkContext ctx = ReservationTalkContext.of(role, reservation, bizTalkCancel);

        // 명확한 조건 변수로 가독성 ↑ (대/소문자 및 null 안전)
        boolean approvedNow = "Y".equalsIgnoreCase(approvalStatus);
        boolean wasApproved = "N".equalsIgnoreCase(bizTalkCancel.getApprovalStatus());
        boolean canceledNow = "Y".equalsIgnoreCase(cancelStatus);

        TalkAction action = TalkAction.NONE;
        if (approvedNow && wasApproved) {
            action = TalkAction.COMPLETE;
        } else if (canceledNow) {
            action = TalkAction.CANCEL;
        }

        if (action != TalkAction.NONE) {
            eventPublisher.publishEvent(new ReservationTalkEvent(action, ctx));
        }

        return new ApiResponse(200, true, "수정 되었습니다.");
    }

    /** 기준 방 + 합쳐 쓸 방을 중복 없이 합친다(기준 방이 항상 첫 번째). */
    private List<Long> mergeRoomIds(Long id, List<Long> extraIds) {
        if (id == null) {
            throw new ValidException("방 ID는 필수입니다.");
        }
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
     * 같은 메뉴 링크(= 룸/마작 같은 종류)여야 하고, 하루 1팀 제한이 있는 방(G룸)은 합칠 수 없다.
     */
    private List<BgmAgitRoom> loadReservableRooms(List<Long> roomIds) {
        List<BgmAgitRoom> rooms = new ArrayList<>();
        for (Long roomId : roomIds) {
            BgmAgitRoom room = bgmAgitRoomRepository.findById(roomId)
                    .orElseThrow(() -> new ValidException("존재하지 않는 방입니다."));
            if (room.isHidden()) {
                throw new ReservationConflictException("예약이 종료된 항목입니다.");
            }
            rooms.add(room);
        }

        if (rooms.size() > 1) {
            BgmAgitRoom primary = rooms.get(0);
            for (BgmAgitRoom room : rooms) {
                boolean sameKind = Objects.equals(room.getBgmAgitRoomLink(), primary.getBgmAgitRoomLink());
                boolean limitedItem = SlotSchedule.maxSelectableSlots(room) != null;
                if (!sameKind || limitedItem) {
                    throw new ReservationConflictException("함께 예약할 수 없는 항목입니다.");
                }
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
        List<TimeRange> reserved = reservedMap
                .getOrDefault(d, Collections.emptyList())
                .stream()
                .sorted(Comparator.comparing(TimeRange::getStart))
                .toList();

        if (userId != null && SlotSchedule.isGroom(room)) {
            boolean alreadyBookedTodayByMe = reserved.stream().anyMatch(r ->
                    Objects.equals(r.getMemberId(), userId) &&
                            !"Y".equals(r.getCancelStatus())
            );
            if (alreadyBookedTodayByMe) {
                return new DayAvailability(List.of(), "G룸은 하루에 1팀당 1개의 예약이 가능하여 다른 시간대의 예약이 불가능 합니다.");
            }
        }

        // 예약은 구간(시작~종료)이라 슬롯마다 구간과 겹치는지로 점유를 판정한다
        List<String> availableSlots = new ArrayList<>();
        for (SlotSchedule.Slot slot : SlotSchedule.of(room, d).slots()) {
            if (d.isEqual(today) && slot.end().isBefore(LocalDateTime.now())) {
                continue;
            }
            boolean overlapped = reserved.stream()
                    .anyMatch(r -> r.isOverlapping(slot.start(), slot.end(), userId));
            if (!overlapped) {
                availableSlots.add(slot.start().format(HHMM));
            }
        }
        return new DayAvailability(availableSlots, null);
    }

    private record DayAvailability(List<String> slots, String message) {
    }

    private void validateUserCancelableReservation(Long memberId, BgmAgitReservation reservation) {
        Long reservationMemberId = reservation.getBgmAgitMember().getBgmAgitMemberId();
        if (!Objects.equals(reservationMemberId, memberId)) {
            throw new ReservationConflictException("본인의 예약만 취소할 수 있습니다.");
        }

        LocalDate today = LocalDate.now(KST);
        if (!reservation.getBgmAgitReservationStartDate().isAfter(today)) {
            throw new ReservationConflictException("예약 취소는 예약일 전날까지만 가능합니다.");
        }
    }

    private boolean isAdmin(String role) {
        return "ROLE_ADMIN".equals(role);
    }

    private boolean isAdmin(List<String> roles) {
        if (roles == null) {
            return false;
        }
        return roles.contains("ROLE_ADMIN") || roles.contains("ADMIN");
    }
}
