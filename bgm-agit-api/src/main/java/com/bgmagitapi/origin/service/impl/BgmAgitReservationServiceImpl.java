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
import com.bgmagitapi.origin.entity.BgmAgitImage;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.origin.event.dto.ReservationTalkEvent;
import com.bgmagitapi.origin.event.dto.ReservationWaitingEvent;
import com.bgmagitapi.origin.event.dto.TalkAction;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import com.bgmagitapi.origin.payment.repository.BgmAgitPaymentRepository;
import com.bgmagitapi.origin.payment.service.PaymentService;
import com.bgmagitapi.origin.payment.service.response.PaymentRefundResult;
import com.bgmagitapi.origin.repository.BgmAgitImageRepository;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.service.BgmAgitReservationService;
import com.bgmagitapi.origin.service.response.BizTalkCancel;
import com.bgmagitapi.origin.service.response.ReservationTalkContext;
import com.bgmagitapi.origin.util.ReservationRefundPolicy;
import com.bgmagitapi.origin.util.SlotSchedule;
import com.querydsl.jpa.impl.JPAQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
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
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {

    /** 영업 기준 시간대. 서버 JVM 타임존에 기대지 말고 날짜 판단은 항상 이걸로 한다. */
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    /** 마작 대탁 3시간 대여료. 조회 응답의 안내용 금액이며 결제 금액과는 별개다. */
    private static final int MAHJONG_RENTAL_PRICE = 40000;

    private final BgmAgitImageRepository bgmAgitImageRepository;
    
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
        // 1. 대상 항목 조회 (첫 번째가 기준 항목, 나머지는 합쳐 쓸 항목)
        List<BgmAgitImage> images = loadReservableImages(mergeImageIds(id, extraIds));
        BgmAgitImage bgmAgitImage = images.get(0);
        BgmAgitImageCategory category = bgmAgitImage.getBgmAgitImageCategory();
        String imageLabel = bgmAgitImage.getBgmAgitImageLabel();
        // 항목 정보는 이미지 기준으로 1회 세팅 (전 기간 만실이어도 제목/인원이 비지 않게)
        String label = images.stream()
                .map(BgmAgitImage::getBgmAgitImageLabel)
                .collect(Collectors.joining(", "));
        String group = bgmAgitImage.getBgmAgitImageGroups();
        // 합쳐 쓸 때 최소인원은 가장 큰 최소값, 최대인원은 합산. 등록 검증도 같은 규칙을 쓴다
        Integer minPeople = effectiveMinPeople(images);
        Integer maxPeople = effectiveMaxPeople(images);

        // 2. 항목별 예약 현황 Map<날짜, List<TimeRange>> (Y: 확정 / N: 대기)
        List<Map<LocalDate, List<TimeRange>>> reservedMaps = images.stream()
                .map(image -> ReservedTimeDto.groupedReservation(
                        bgmAgitReservationRepository.findReservations(
                                labelGb, link, image.getBgmAgitImageId(), today, endOfWindow)))
                .toList();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        // 3. 날짜별 시간 슬롯 생성 (여러 항목이면 전부 비어 있는 시간만 = 교집합)
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

            for (int i = 0; i < images.size(); i++) {
                DayAvailability availability = resolveDayAvailability(
                        images.get(i), reservedMaps.get(i), d, today, userId, formatter);
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
        //
        // 예전에는 여기서 LunarCalendar 로 공휴일 집합을 만들어 주말·공휴일을 같은 요금으로 묶었지만,
        // 10월 요금표는 주말을 토·일로만 정의한다. 판정이 갈리면 화면 배지는 주말가인데
        // 청구는 평일가가 되므로 SlotSchedule.isWeekendRate 하나만 보게 했다.
        List<BgmAgitReservationResponse.PriceByDate> prices = new ArrayList<>();

        for (LocalDate d = today; !d.isAfter(endOfWindow); d = d.plusDays(1)) {
            if (d.isEqual(now)) {
                continue;
            }
            boolean isWeekend = SlotSchedule.isWeekendRate(d);
            // 마작 대탁은 개편 대상이 아니라 예전 그대로 3시간 대여료를 그대로 내려준다(1인 단가가 아니다)
            int price = SlotSchedule.isMahjongRental(category)
                    ? MAHJONG_RENTAL_PRICE
                    : SlotSchedule.unitPrice(d);
            prices.add(new BgmAgitReservationResponse.PriceByDate(d, price, isWeekend));
        }

        // 5. 슬롯 정책(후보 시간대 / 선택 제한 / 예약 타입) — 프론트가 하드코딩 대신 이걸 쓴다
        List<BgmAgitReservationResponse.SlotRange> slotRanges = SlotSchedule.of(category, imageLabel, today)
                .slots()
                .stream()
                .map(slot -> new BgmAgitReservationResponse.SlotRange(
                        slot.start().format(formatter),
                        slot.end().format(formatter)))
                .toList();

        // 룸은 인원이 정해져야 총액이 나오므로 여기서는 방식만 알려주고 금액은 prices 의 단가로 조립하게 한다.
        // 마작 대탁만 예전처럼 항목당 정액을 합산해 확정 금액을 내려준다.
        boolean flatPricing = SlotSchedule.isMahjongRental(category);
        Integer depositAmount = flatPricing
                ? SlotSchedule.totalPaymentAmount(images, 0, today)
                : null;

        return new BgmAgitReservationResponse(
                timeSlots, prices, label, group, minPeople, maxPeople,
                slotRanges,
                SlotSchedule.maxSelectableSlots(category, imageLabel),
                SlotSchedule.resolveReservationType(category).name(),
                flatPricing ? "FLAT" : "PER_PERSON",
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

        List<BgmAgitImage> images = bgmAgitImageRepository.findReservableImages(labelGb, link);

        String blockedMessage = resolveDateBlockMessage(date, now);
        if (blockedMessage != null) {
            // 날짜 자체가 불가면 예약을 조회할 이유가 없다.
            List<AvailableRoomsResponse.Room> blockedRooms = images.stream()
                    .map(image -> toAvailableRoom(image, date, List.of(), blockedMessage))
                    .toList();
            return new AvailableRoomsResponse(date, true, blockedMessage,
                    SlotSchedule.closedWeekdayForJs(), blockedRooms);
        }

        List<Long> imageIds = images.stream().map(BgmAgitImage::getBgmAgitImageId).toList();
        Map<Long, List<ReservedTimeDto>> reservedByImage =
                bgmAgitReservationRepository.findReservedTimesByImageIdsAndDate(imageIds, date);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        List<AvailableRoomsResponse.Room> rooms = new ArrayList<>();
        for (BgmAgitImage image : images) {
            Map<LocalDate, List<TimeRange>> reservedMap = ReservedTimeDto.groupedReservation(
                    reservedByImage.getOrDefault(image.getBgmAgitImageId(), List.of()));
            // 판정은 예약 캘린더와 같은 메서드를 탄다. 여기서 따로 구현하면 두 화면의 숫자가 갈린다.
            DayAvailability availability = resolveDayAvailability(image, reservedMap, date, now, userId, formatter);
            rooms.add(toAvailableRoom(image, date, availability.slots(), availability.message()));
        }

        return new AvailableRoomsResponse(date, false, null, SlotSchedule.closedWeekdayForJs(), rooms);
    }

    /**
     * 그 날짜 전체가 예약 불가인 사유. 가능한 날짜면 null.
     * 문구는 조회(getReservation)·등록(createReservation)에서 쓰던 것을 그대로 재사용한다.
     */
    private String resolveDateBlockMessage(LocalDate date, LocalDate now) {
        if (date.isEqual(now)) {
            return "당일 예약은 불가능합니다.";
        }
        if (!SlotSchedule.isWithinReservableWindow(date, now)) {
            return "예약은 내일부터 " + SlotSchedule.RESERVATION_WINDOW_MONTHS + "개월 이내의 날짜만 가능합니다.";
        }
        if (SlotSchedule.isClosedDay(date)) {
            return SlotSchedule.CLOSED_DAY_MESSAGE;
        }
        return null;
    }

    private AvailableRoomsResponse.Room toAvailableRoom(BgmAgitImage image,
                                                        LocalDate date,
                                                        List<String> availableSlots,
                                                        String message) {
        BgmAgitImageCategory category = image.getBgmAgitImageCategory();
        String label = image.getBgmAgitImageLabel();
        int totalSlotCount = SlotSchedule.of(category, label, date).slots().size();
        return new AvailableRoomsResponse.Room(
                image.getBgmAgitImageId(),
                label,
                image.getBgmAgitImageGroups(),
                category == null ? null : category.name(),
                image.getBgmAgitImageMinPeople(),
                image.getBgmAgitImageMaxPeople(),
                totalSlotCount,
                availableSlots.size(),
                !availableSlots.isEmpty(),
                message
        );
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
        // 합쳐 예약(예: M-1 + M-2)이면 항목이 여러 개. 첫 번째가 기준 항목
        List<BgmAgitImage> images = loadReservableImages(
                mergeImageIds(request.getBgmAgitImageId(), request.getBgmAgitImageIds()));
        BgmAgitImage  bgmAgitImage = images.get(0);
        BgmAgitImageCategory bgmAgitImageCategory = bgmAgitImage.getBgmAgitImageCategory();
        String imageLabel = bgmAgitImage.getBgmAgitImageLabel();
        List<String> timeList = request.getReservationExpandedTimeSlots(bgmAgitImageCategory, imageLabel);
        Integer people = request.getBgmAgitReservationPeople();
        String reservationRequest = !StringUtils.hasText(request.getBgmAgitReservationRequest()) ? "없음" : request.getBgmAgitReservationRequest();

        // 인원이 곧 결제 금액이므로 서버가 범위를 직접 검증한다.
        // 프론트 스테퍼만 믿으면 people=1 로 POST 해서 7인 룸을 1인 요금에 잡을 수 있다.
        validateReservationPeople(images, people);

        // 시간대는 연속 구간이어야 한다. 띄엄띄엄 고르면 사이 시간이 비어 보이면서 실제로는 못 쓰는 룸이 된다.
        List<LocalTime> requestedStartTimes = request.getStartTimeEndTime().stream()
                .map(LocalTime::parse)
                .toList();
        if (!SlotSchedule.of(bgmAgitImageCategory, imageLabel, LocalDate.now(KST)).isContiguous(requestedStartTimes)) {
            throw new ReservationConflictException("예약 시간은 연속된 시간대로 선택해 주세요.");
        }
        // 날짜 보정
        LocalDate kstDate = ZonedDateTime
                .parse(request.getBgmAgitReservationStartDate())
                .withZoneSameInstant(KST)
                .toLocalDate();

        // 예약 가능 기간: 당일·과거 불가 + 현재일 기준 RESERVATION_WINDOW_MONTHS 개월 이내.
        // 조회(getReservation)에서 슬롯을 안 내려주는 것만으로는 직접 POST 를 막지 못하므로 등록에서도 검증한다.
        LocalDate kstToday = LocalDate.now(KST);
        if (!SlotSchedule.isWithinReservableWindow(kstDate, kstToday)) {
            throw new ReservationConflictException(
                    "예약은 내일부터 " + SlotSchedule.RESERVATION_WINDOW_MONTHS + "개월 이내의 날짜만 가능합니다.");
        }

        // 수요일은 무인운영으로 예약 불가
        if (SlotSchedule.isClosedDay(kstDate)) {
            throw new ReservationConflictException(SlotSchedule.CLOSED_DAY_MESSAGE);
        }

        // 예약 기본 정보 조회
        BgmAgitMember member = bgmAgitMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        // 예약 타입은 클라이언트 값이 아니라 이미지 카테고리로 서버가 결정
        String reservationType = SlotSchedule.resolveReservationType(bgmAgitImageCategory).name();
        
        Long maxReservationNo = bgmAgitReservationRepository.findMaxReservationNo();
        maxReservationNo = (maxReservationNo == null) ? 1L : maxReservationNo + 1L;
        // 신규 예약 생성 — 합쳐 예약이면 같은 예약번호에 항목별 슬롯 행을 만든다
        List<BgmAgitReservation> list = new ArrayList<>();
        for (BgmAgitImage image : images) {
            // 항목별 기존 예약(확정 + 내 대기건) 시간대
            Set<String> existingTimeSlots = bgmAgitReservationRepository
                    .findExistingReservations(image, kstDate, "N")
                    .stream()
                    .filter(r ->
                            "Y".equals(r.getBgmAgitReservationApprovalStatus()) ||
                                    (
                                            "N".equals(r.getBgmAgitReservationApprovalStatus()) &&
                                                    Objects.equals(r.getBgmAgitMember().getBgmAgitMemberId(), userId)
                                    )
                    )
                    .map(r -> r.getBgmAgitReservationStartTime() + "-" + r.getBgmAgitReservationEndTime())
                    .collect(Collectors.toSet());

            for (String timeSlot : timeList) {
                // "14:00 ~ 15:00" → ["14:00", "15:00"]
                String[] times = timeSlot.split(" ~ ");
                if (times.length != 2) {
                    throw new IllegalArgumentException("잘못된 시간 슬롯 형식입니다: " + timeSlot);
                }
                LocalTime startTime = LocalTime.parse(times[0]);
                LocalTime endTime = LocalTime.parse(times[1]);

                String slotKey = startTime + "-" + endTime;
                if (existingTimeSlots.contains(slotKey)) {
                    throw new ReservationConflictException(
                            image.getBgmAgitImageLabel() + " 이미 예약된 시간대입니다: " + slotKey);
                }

                BgmAgitReservation reservation = new BgmAgitReservation(
                        member, image, reservationType, startTime, endTime, kstDate,maxReservationNo,people,reservationRequest
                );
                bgmAgitReservationRepository.save(reservation);
                list.add(reservation);
            }
        }

        eventPublisher.publishEvent(new ReservationWaitingEvent(member,bgmAgitImage,list));
        return new ApiResponse(200, true, "예약이 완료되었습니다.");
    }

    @Override
    public PaymentOrderResponse createPaymentOrder(Long reservationNo, Long userId) {
        // 예약 그룹(같은 RESERVATION_NO 슬롯 행들) 조회
        List<BgmAgitReservation> group = bgmAgitReservationRepository.findReservationList(reservationNo);
        if (group.isEmpty()) {
            throw new ReservationConflictException("존재하지 않는 예약입니다.");
        }
        BgmAgitReservation first = group.get(0);

        // 소유자 검증: 본인 예약만 결제 가능
        if (!Objects.equals(first.getBgmAgitMember().getBgmAgitMemberId(), userId)) {
            throw new ReservationConflictException("본인의 예약이 아닙니다.");
        }
        // 취소된 예약은 결제 불가
        boolean canceled = group.stream()
                .anyMatch(r -> "Y".equals(r.getBgmAgitReservationCancelStatus()));
        if (canceled) {
            throw new ReservationConflictException("취소된 예약입니다.");
        }
        // 이미 확정(결제완료)된 예약은 재결제 불가
        boolean approved = group.stream()
                .anyMatch(r -> "Y".equals(r.getBgmAgitReservationApprovalStatus()));
        if (approved) {
            throw new ReservationConflictException("이미 확정된 예약입니다.");
        }

        // 이미 지난 예약은 결제 불가. 없으면 끝난 예약에 전액을 결제하고 환불은 0%가 되는 조합이 만들어진다
        LocalDateTime useStartAt = SlotSchedule.useStartAt(group);
        if (useStartAt != null && !useStartAt.isAfter(LocalDateTime.now(KST))) {
            throw new ReservationConflictException("이미 시작된 예약은 결제할 수 없습니다.");
        }

        // 금액 서버 계산 — 저장된 인원과 예약일로 다시 구한다(클라이언트 금액 불신).
        // 예약 대기 알림톡의 금액 안내도 같은 메서드를 쓰므로 여기서 갈라지지 않게 할 것
        List<BgmAgitImage> images = group.stream().map(BgmAgitReservation::getBgmAgitImage).toList();
        Integer people = first.getBgmAgitReservationPeople();
        validateReservationPeople(images, people);

        LocalDate reservationDate = first.getBgmAgitReservationStartDate();
        int amount = SlotSchedule.totalPaymentAmount(images, people, reservationDate);
        String orderName = "BGM아지트 예약 - " + reservationDate;

        // 인원·단가를 결제행에 박아 둔다. 환불은 결제 시점 기준으로 계산해야 하는데
        // 예약의 인원은 뒤에 바뀔 수 있어서 그때 가서는 복원할 수 없다
        Integer unitPrice = SlotSchedule.isMahjongRental(first.getBgmAgitImage().getBgmAgitImageCategory())
                ? null
                : SlotSchedule.unitPrice(reservationDate);

        // 공통 결제 모듈에 주문 생성 위임
        return paymentService.createOrder(userId, reservationNo, amount, orderName, people, unitPrice);
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
        
        // 1) 페이지 키 조회 (예약번호)
        List<Long> pageNos = bgmAgitReservationRepository
                .findReservationNosPageForDetail(memberId, isUser, start, end, pageable);
        
        if (pageNos.isEmpty()) {
            return new PageImpl<>(new ArrayList<>(), pageable, 0L);
        }
        
        // 2) 상세 로딩
        List<BgmAgitReservation> rows = bgmAgitReservationRepository
                .findReservationsByNosForDetail(pageNos, memberId, isUser, start, end);

        // 3) 그룹핑 (키 순서 유지)
        Map<Long, List<BgmAgitReservation>> bucket = rows.stream()
                .collect(Collectors.groupingBy(BgmAgitReservation::getBgmAgitReservationNo));

        // 결제 완료건 영수증 URL 배치 조회 (예약번호별 최신 결제)
        Map<Long, String> receiptUrls = bgmAgitPaymentRepository.findDoneReceiptUrlsByReservationNos(pageNos);
        // 환불 예상액 계산에 쓸 결제 잔액 배치 조회
        Map<Long, Integer> paidAmounts = bgmAgitPaymentRepository.findPaidAmountsByReservationNos(pageNos);

        LocalDateTime now = LocalDateTime.now(KST);

        // pageNos 순서대로 DTO 만들기
        List<GroupedReservationResponse> content = new ArrayList<>();
        for (Long no : pageNos) {
            List<BgmAgitReservation> list = bucket.get(no);
            if (list == null){
                continue;
            }
            GroupedReservationResponse dto = new GroupedReservationResponse(no,list);
            dto.setReceiptUrl(receiptUrls.get(no));

            int paid = paidAmounts.getOrDefault(no, 0);
            int rate = ReservationRefundPolicy.refundRate(SlotSchedule.useStartAt(list), now);
            dto.setPaidAmount(paid);
            dto.setRefundRate(rate);
            dto.setRefundAmount(ReservationRefundPolicy.refundAmount(paid, rate));
            content.add(dto);
        }
        
        // 4) total count
        JPAQuery<Long> countQuery = bgmAgitReservationRepository.countReservationsDistinctForDetail(memberId, isUser, start, end);
        
        
        return  PageableExecutionUtils.getPage(content, pageable,countQuery::fetchOne);
    }
    
    @Override
    @Transactional(readOnly = true)
    public AdminReservationBoardResponse getReservationBoard(LocalDate date, List<String> roles) {

        if (!isAdmin(roles)) {
            throw new ValidException("관리자만 조회할 수 있습니다.");
        }

        List<BgmAgitReservation> rows = bgmAgitReservationRepository.findReservationsByDate(date);

        // 한 예약 = 1시간 슬롯 여러 행. 예약번호로 먼저 묶는다.
        // groupingBy 는 키가 null 이면 NPE 라, 예약번호 없는 legacy 행은 건너뛴다.
        Map<Long, List<BgmAgitReservation>> grouped = rows.stream()
                .filter(row -> row.getBgmAgitReservationNo() != null)
                .collect(Collectors.groupingBy(
                        BgmAgitReservation::getBgmAgitReservationNo,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        Map<Long, String> receiptUrls =
                bgmAgitPaymentRepository.findDoneReceiptUrlsByReservationNos(new ArrayList<>(grouped.keySet()));

        Map<String, List<AdminReservationBoardResponse.Item>> byRoom = new LinkedHashMap<>();
        // 예약 장소 → 이미지 카테고리(ROOM / MAHJONG ...). 프론트 탭 분류용
        Map<String, String> roomCategories = new LinkedHashMap<>();
        int confirmed = 0;
        int waiting = 0;
        int canceled = 0;
        int people = 0;

        for (Map.Entry<Long, List<BgmAgitReservation>> entry : grouped.entrySet()) {
            List<BgmAgitReservation> slots = entry.getValue();
            if (slots.isEmpty()) {
                continue;
            }
            BgmAgitReservation head = slots.get(0);

            boolean isCanceled = "Y".equalsIgnoreCase(head.getBgmAgitReservationCancelStatus());
            boolean isConfirmed = !isCanceled && "Y".equalsIgnoreCase(head.getBgmAgitReservationApprovalStatus());

            if (isCanceled) {
                canceled++;
            } else if (isConfirmed) {
                confirmed++;
            } else {
                waiting++;
            }
            if (!isCanceled && head.getBgmAgitReservationPeople() != null) {
                people += head.getBgmAgitReservationPeople();
            }

            BgmAgitReservation first = slots.stream()
                    .min(Comparator.comparingInt(r -> toBoardMinutes(r.getBgmAgitReservationStartTime())))
                    .orElse(head);
            BgmAgitReservation last = slots.stream()
                    .max(Comparator.comparingInt(r -> toBoardMinutes(r.getBgmAgitReservationEndTime())))
                    .orElse(head);

            AdminReservationBoardResponse.Item item = new AdminReservationBoardResponse.Item(
                    entry.getKey(),
                    head.getBgmAgitMember() != null ? head.getBgmAgitMember().getBgmAgitMemberName() : null,
                    extractPhoneNo(head),
                    head.getBgmAgitReservationPeople(),
                    head.getBgmAgitReservationRequest(),
                    head.getBgmAgitReservationApprovalStatus(),
                    head.getBgmAgitReservationCancelStatus(),
                    receiptUrls.get(entry.getKey()),
                    head.getRegistDate(),
                    formatTime(first.getBgmAgitReservationStartTime()),
                    formatTime(last.getBgmAgitReservationEndTime()),
                    toBoardMinutes(first.getBgmAgitReservationStartTime()),
                    toBoardMinutes(last.getBgmAgitReservationEndTime())
            );

            String roomName = head.getBgmAgitImage() != null ? head.getBgmAgitImage().getBgmAgitImageLabel() : null;
            String roomKey = StringUtils.hasText(roomName) ? roomName : "기타";
            byRoom.computeIfAbsent(roomKey, key -> new ArrayList<>()).add(item);

            if (head.getBgmAgitImage() != null && head.getBgmAgitImage().getBgmAgitImageCategory() != null) {
                roomCategories.putIfAbsent(roomKey, head.getBgmAgitImage().getBgmAgitImageCategory().name());
            }
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

    /**
     * 현황판 가로축용 분값. 하루 경계(10시) 이전은 익일 새벽으로 보고 +1440 한다.
     * 경계값을 여기서 따로 들고 있으면 환불 기한·알림톡 정렬과 갈리므로 SlotSchedule 에 위임한다.
     */
    private int toBoardMinutes(LocalTime time) {
        return SlotSchedule.toSortableMinutes(time);
    }

    private String formatTime(LocalTime time) {
        return time != null ? time.format(DateTimeFormatter.ofPattern("HH:mm")) : null;
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
    public ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request, List<String> roles) {


        Long reservationNo = request.getReservationNo();
        // 상태값은 Y/N 으로 정규화해서 받는다.
        //
        // 게이트는 equalsIgnoreCase 인데 DB 에는 요청 문자열이 그대로 들어가고 판독은 "Y".equals 라
        // 대소문자가 갈렸다. cancelStatus="y" 로 보내면 환불은 집행되는데 DB 에는 'y' 가 남아
        // 예약내역·현황판·결제 검증이 모두 "취소 아님"으로 봤다 — 환불받고 자리는 유지되는 상태.
        String cancelStatus = normalizeYn(request.getCancelStatus());
        String approvalStatus = normalizeYn(request.getApprovalStatus());

        List<BgmAgitReservation> reservations = bgmAgitReservationRepository.findReservationList(reservationNo);
        if (reservations.isEmpty()) {
            throw new ReservationConflictException("존재하지 않는 예약입니다.");
        }

        boolean admin = isAdmin(roles);
        boolean canceling = "Y".equalsIgnoreCase(cancelStatus);

        // 손님이 이 API 로 할 수 있는 일은 "본인 예약 취소" 하나뿐이다.
        //
        // 예전에는 상태 검증이 취소 분기에만 있어서, 프론트가 숨긴 동작을 API 직접 호출로 전부 할 수 있었다.
        //  - approvalStatus='Y'  → 결제 없이 확정(예약금 1만원 시절과 달리 지금은 한 건에 수만 원이다)
        //  - cancelStatus='N'    → 이미 환불받은 예약을 되살리기(돈은 돌려받고 자리는 그대로)
        //  - 남의 예약번호       → 소유자 검증이 취소 분기 안에만 있어 그대로 통과
        // 관리자가 남의 예약을 확정·취소하는 것은 전화·현장 예약 대응이라 의도된 동작이므로 그대로 둔다.
        if (!admin) {
            if ("Y".equalsIgnoreCase(approvalStatus)) {
                throw new ReservationConflictException("예약 확정은 관리자만 할 수 있습니다. 결제를 완료하시면 자동으로 확정됩니다.");
            }
            if (!canceling) {
                throw new ReservationConflictException("예약 상태를 변경할 수 없습니다. 매장으로 문의해 주세요.");
            }
            validateUserCancelableReservation(id, reservations);
        }

        // 이미 취소된 예약은 여기서 끊는다. 재취소를 막지 않으면 잔액이 남아 있는 결제를 또 환불하게 된다
        // (전액취소 시절엔 토스가 ALREADY_CANCELED_PAYMENT 로 막아줘서 드러나지 않던 구멍이다)
        if (canceling && reservations.stream()
                .allMatch(r -> "Y".equalsIgnoreCase(r.getBgmAgitReservationCancelStatus()))) {
            return new ApiResponse(200, true, "이미 취소된 예약입니다.");
        }


        List<Long> idList = reservations.stream()
                .map(BgmAgitReservation::getBgmAgitReservationId)
                .toList();

        PaymentRefundResult refund = null;
        if (canceling) {
            // 환불 비율은 이용 시작 시각 기준 48h/24h. 관리자 취소도 같은 규칙을 쓴다
            int rate = ReservationRefundPolicy.refundRate(
                    SlotSchedule.useStartAt(reservations), LocalDateTime.now(KST));
            refund = paymentService.refundReservation(reservationNo, rate, "예약 취소");
            // 승인되지 않은 주문이 남아 있으면 취소 뒤에 결제되는 일이 생긴다
            paymentService.abortReadyOrders(reservationNo, "예약 취소됨");
        }

        BizTalkCancel bizTalkCancel = bgmAgitReservationRepository.findBizTalkCancel(reservationNo);
        
        if (!idList.isEmpty()) {
            bgmAgitReservationRepository.updateCancelAndApprovalStatus(
                    cancelStatus, approvalStatus, idList
            );
        }

        if (bizTalkCancel == null) {
            return new ApiResponse(404, false, "전송 대상이 없습니다.");
        }

        // 알림톡 쪽은 role 문자열을 "ROLE_ADMIN" 인지만 비교하므로 판정 결과를 그대로 넘긴다.
        // 예전엔 JWT roles 의 첫 값을 그대로 썼는데, 관리자에게 USER 권한이 같이 있으면
        // 첫 값이 ROLE_USER 로 나와 관리자 취소가 사용자 취소 문구로 나갈 수 있었다.
        ReservationTalkContext ctx = ReservationTalkContext.of(
                admin ? "ROLE_ADMIN" : "ROLE_USER", reservations, bizTalkCancel);

        // 명확한 조건 변수로 가독성 ↑ (대/소문자 및 null 안전)
        boolean approvedNow = "Y".equalsIgnoreCase(approvalStatus);
        boolean wasApproved = "N".equalsIgnoreCase(bizTalkCancel.getApprovalStatus());
        boolean canceledNow = "Y".equalsIgnoreCase(cancelStatus);
        // (필요하면 과거 cancelStatus 비교도 추가 가능)
        
        TalkAction action = TalkAction.NONE;
        if (approvedNow && wasApproved) {
            action = TalkAction.COMPLETE;
        } else if (canceledNow) {
            action = TalkAction.CANCEL;
        }
        
        if (action != TalkAction.NONE) {
            eventPublisher.publishEvent(new ReservationTalkEvent(action, ctx));
        }

        // 전송 조건이 아닌 경우
        return new ApiResponse(200, true, refundMessage(refund));
    }

    @Override
    public ApiResponse modifyReservationPeople(Long userId, BgmAgitReservationPeopleRequest request, List<String> roles) {
        Long reservationNo = request.getReservationNo();
        Integer newPeople = request.getPeople();

        List<BgmAgitReservation> group = bgmAgitReservationRepository.findReservationList(reservationNo);
        if (group.isEmpty()) {
            throw new ReservationConflictException("존재하지 않는 예약입니다.");
        }
        BgmAgitReservation first = group.get(0);

        if (!isAdmin(roles)
                && !Objects.equals(first.getBgmAgitMember().getBgmAgitMemberId(), userId)) {
            throw new ReservationConflictException("본인의 예약만 변경할 수 있습니다.");
        }
        if (group.stream().anyMatch(r -> "Y".equalsIgnoreCase(r.getBgmAgitReservationCancelStatus()))) {
            throw new ReservationConflictException("취소된 예약입니다.");
        }

        LocalDateTime useStartAt = SlotSchedule.useStartAt(group);
        if (useStartAt != null && !useStartAt.isAfter(LocalDateTime.now(KST))) {
            throw new ReservationConflictException("이미 시작된 예약은 변경할 수 없습니다. 매장으로 문의해 주세요.");
        }

        Integer currentPeople = first.getBgmAgitReservationPeople();
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

        List<BgmAgitImage> images = group.stream().map(BgmAgitReservation::getBgmAgitImage).toList();
        validateReservationPeople(images, newPeople);

        boolean approved = group.stream()
                .anyMatch(r -> "Y".equalsIgnoreCase(r.getBgmAgitReservationApprovalStatus()));

        PaymentRefundResult refund = null;
        if (approved) {
            int rate = ReservationRefundPolicy.refundRate(useStartAt, LocalDateTime.now(KST));
            refund = paymentService.refundPeopleReduction(
                    reservationNo, currentPeople - newPeople, rate, "예약 인원 축소");
        } else {
            // 미결제 대기건은 환불할 게 없다. 다만 옛 인원으로 만들어 둔 주문은 못 쓰게 막아야 한다
            paymentService.abortReadyOrders(reservationNo, "예약 인원 변경");
        }

        bgmAgitReservationRepository.updateReservationPeople(reservationNo, newPeople);

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

    /** 기준 항목 + 합쳐 쓸 항목을 중복 없이 합친다(기준 항목이 항상 첫 번째). */
    private List<Long> mergeImageIds(Long id, List<Long> extraIds) {
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
     * 예약 가능한 항목들을 조회하고 합쳐 쓸 수 있는 조합인지 검증한다.
     * 같은 카테고리·같은 메뉴(페이지)여야 하고, 라벨 조합이 화이트리스트에 있어야 한다.
     *
     * 예전에는 "하루 1팀 제한이 있는 항목(G룸)은 합칠 수 없다"로 걸렀는데, 모든 룸의 슬롯 제한이
     * 풀리면서 그 조건이 항상 false 가 되어 방어가 사라졌다. 그래서 SlotSchedule 의 허용 조합을 본다.
     */
    private List<BgmAgitImage> loadReservableImages(List<Long> imageIds) {
        List<BgmAgitImage> images = new ArrayList<>();
        for (Long imageId : imageIds) {
            BgmAgitImage image = bgmAgitImageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("존재 하지않는 이미지 입니다."));
            if (image.isHidden()) {
                throw new ReservationConflictException("예약이 종료된 항목입니다.");
            }
            images.add(image);
        }

        if (images.size() > 1) {
            BgmAgitImage primary = images.get(0);
            for (BgmAgitImage image : images) {
                boolean sameKind = image.getBgmAgitImageCategory() == primary.getBgmAgitImageCategory()
                        && Objects.equals(image.getBgmAgitMenuLink(), primary.getBgmAgitMenuLink());
                if (!sameKind) {
                    throw new ReservationConflictException("함께 예약할 수 없는 항목입니다.");
                }
            }
            List<String> labels = images.stream().map(BgmAgitImage::getBgmAgitImageLabel).toList();
            if (!SlotSchedule.isCombinable(labels)) {
                throw new ReservationConflictException("함께 예약할 수 없는 항목입니다.");
            }
        }
        return images;
    }

    /** 항목 하나의 특정 날짜 예약 가능 시간대. message 가 있으면 그 날짜는 전체 불가. */
    private DayAvailability resolveDayAvailability(BgmAgitImage image,
                                                  Map<LocalDate, List<TimeRange>> reservedMap,
                                                  LocalDate d,
                                                  LocalDate today,
                                                  Long userId,
                                                  DateTimeFormatter formatter) {
        BgmAgitImageCategory category = image.getBgmAgitImageCategory();
        String imageLabel = image.getBgmAgitImageLabel();

        List<TimeRange> reserved = reservedMap
                .getOrDefault(d, Collections.emptyList())
                .stream()
                .sorted(Comparator.comparing(TimeRange::getStart))
                .toList();

        // G룸 "하루 1팀 1시간대" 차단이 여기 있었으나, 모든 룸이 시간 자유 선택으로 바뀌면서 제거됨

        List<String> availableSlots = new ArrayList<>();
        for (SlotSchedule.Slot slot : SlotSchedule.of(category, imageLabel, d).slots()) {
            if (d.isEqual(today) && slot.end().isBefore(LocalDateTime.now(KST))) {
                continue;
            }
            boolean overlapped = reserved.stream()
                    .anyMatch(r -> r.isOverlapping(slot.start(), slot.end(), userId));
            if (!overlapped) {
                availableSlots.add(slot.start().format(formatter));
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
     * 합쳐 예약의 최소 인원 — 각 항목 최소값 중 가장 큰 값.
     * 조회 응답(minPeople)과 등록 검증이 같은 규칙을 봐야 화면에서 고를 수 있는 값이 서버에서 거절되지 않는다.
     */
    private Integer effectiveMinPeople(List<BgmAgitImage> images) {
        return images.stream()
                .map(BgmAgitImage::getBgmAgitImageMinPeople)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(null);
    }

    /** 합쳐 예약의 최대 인원 — 항목별 최대값 합산. 값이 하나도 없으면 null(=제한 없음). */
    private Integer effectiveMaxPeople(List<BgmAgitImage> images) {
        List<Integer> maxima = images.stream()
                .map(BgmAgitImage::getBgmAgitImageMaxPeople)
                .filter(Objects::nonNull)
                .toList();
        return maxima.isEmpty() ? null : maxima.stream().reduce(0, Integer::sum);
    }

    /** 예약 인원이 항목의 허용 범위 안인지. 컬럼이 비어 있는 항목은 그 방향 검증을 건너뛴다. */
    private void validateReservationPeople(List<BgmAgitImage> images, Integer people) {
        if (people == null || people < 1) {
            throw new ReservationConflictException("예약 인원을 입력해 주세요.");
        }
        Integer min = effectiveMinPeople(images);
        Integer max = effectiveMaxPeople(images);
        if (min != null && people < min) {
            throw new ReservationConflictException("최소 " + min + "명부터 예약할 수 있습니다.");
        }
        if (max != null && people > max) {
            throw new ReservationConflictException("최대 " + max + "명까지 예약할 수 있습니다.");
        }
    }

    private void validateUserCancelableReservation(Long memberId, List<BgmAgitReservation> reservations) {
        BgmAgitReservation first = reservations.get(0);
        Long reservationMemberId = first.getBgmAgitMember().getBgmAgitMemberId();
        if (!Objects.equals(reservationMemberId, memberId)) {
            throw new ReservationConflictException("본인의 예약만 취소할 수 있습니다.");
        }

        // 기한 제한은 날짜가 아니라 시각으로 본다. 24시간 이내 취소도 허용하고 환불만 0원이다
        // (자리를 비워주는 쪽이 매장에 이득이라 막지 않는다). 이미 시작된 예약만 거절한다.
        LocalDateTime useStartAt = SlotSchedule.useStartAt(reservations);
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
