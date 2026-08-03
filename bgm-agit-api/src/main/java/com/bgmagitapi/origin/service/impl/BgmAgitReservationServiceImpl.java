package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ReservationConflictException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitReservationResponse;
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
import com.bgmagitapi.origin.repository.BgmAgitImageRepository;
import com.bgmagitapi.origin.repository.BgmAgitMemberRepository;
import com.bgmagitapi.origin.repository.BgmAgitReservationRepository;
import com.bgmagitapi.origin.service.BgmAgitReservationService;
import com.bgmagitapi.origin.service.response.BizTalkCancel;
import com.bgmagitapi.origin.service.response.ReservationTalkContext;
import com.bgmagitapi.origin.util.LunarCalendar;
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
        Authentication authentication = SecurityContextHolder.getContextHolderStrategy().getContext().getAuthentication();
        Long userId = (authentication instanceof JwtAuthenticationToken bearerAuth)
                ? ((Jwt) bearerAuth.getPrincipal()).getClaim("id")
                : null;
        LocalDate today = date;
        LocalDate endOfYear = today.plusMonths(3);
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
        // 합쳐 쓸 때 최소인원은 가장 큰 최소값, 최대인원은 합산
        Integer minPeople = images.stream()
                .map(BgmAgitImage::getBgmAgitImageMinPeople)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(null);
        Integer maxPeople = images.stream()
                .map(BgmAgitImage::getBgmAgitImageMaxPeople)
                .filter(Objects::nonNull)
                .reduce(0, Integer::sum);

        // 2. 항목별 예약 현황 Map<날짜, List<TimeRange>> (Y: 확정 / N: 대기)
        List<Map<LocalDate, List<TimeRange>>> reservedMaps = images.stream()
                .map(image -> ReservedTimeDto.groupedReservation(
                        bgmAgitReservationRepository.findReservations(
                                labelGb, link, image.getBgmAgitImageId(), today, endOfYear)))
                .toList();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        // 3. 날짜별 시간 슬롯 생성 (여러 항목이면 전부 비어 있는 시간만 = 교집합)
        List<BgmAgitReservationResponse.TimeSlotByDate> timeSlots = new ArrayList<>();

        for (LocalDate d = today; !d.isAfter(endOfYear); d = d.plusDays(1)) {
            if (d.isEqual(LocalDate.now())) {
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

        // 4. 공휴일/주말 가격 계산
        Set<String> holidaySet = new HashSet<>();
        
        int startYear = today.getYear();
        int endYear = endOfYear.getYear();
        
        for (int y = startYear; y <= endYear; y++) {
            holidaySet.addAll(new LunarCalendar().getHolidaySet(String.valueOf(y)));
        }
        
        DateTimeFormatter formatterYY = DateTimeFormatter.ofPattern("yyyyMMdd");
        
        List<BgmAgitReservationResponse.PriceByDate> prices = new ArrayList<>();
        
        for (LocalDate d = today; !d.isAfter(endOfYear); d = d.plusDays(1)) {
            if (d.isEqual(LocalDate.now())) {
                continue;
            }
            String dateStr = d.format(formatterYY);
            boolean isWeekend = d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean isHoliday = holidaySet.contains(dateStr);
            int price = (isWeekend || isHoliday) ? 4000 : 3000;
            if (SlotSchedule.isMahjongRental(category)) {
                price = 40000;
            }
            prices.add(new BgmAgitReservationResponse.PriceByDate(d, price, isWeekend || isHoliday));
        }

        // 5. 슬롯 정책(후보 시간대 / 선택 제한 / 예약 타입) — 프론트가 하드코딩 대신 이걸 쓴다
        List<BgmAgitReservationResponse.SlotRange> slotRanges = SlotSchedule.of(category, imageLabel, today)
                .slots()
                .stream()
                .map(slot -> new BgmAgitReservationResponse.SlotRange(
                        slot.start().format(formatter),
                        slot.end().format(formatter)))
                .toList();

        return new BgmAgitReservationResponse(
                timeSlots, prices, label, group, minPeople, maxPeople,
                slotRanges,
                SlotSchedule.maxSelectableSlots(category, imageLabel),
                SlotSchedule.resolveReservationType(category).name()
        );

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
        // 날짜 보정
        LocalDate kstDate = ZonedDateTime
                .parse(request.getBgmAgitReservationStartDate())
                .withZoneSameInstant(ZoneId.of("Asia/Seoul"))
                .toLocalDate();

        // 수요일은 무인운영으로 예약 불가
        if (kstDate.getDayOfWeek() == java.time.DayOfWeek.WEDNESDAY) {
            throw new ReservationConflictException("수요일은 무인운영으로 예약이 불가능합니다.");
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

        // 금액 서버 계산(항목당 기본 1만, M룸 3만) — 합쳐 예약이면 항목 수만큼 합산
        List<BgmAgitImage> images = group.stream()
                .map(BgmAgitReservation::getBgmAgitImage)
                .filter(distinctByImageId())
                .toList();
        int amount = images.stream()
                .mapToInt(image -> SlotSchedule.resolveDepositAmount(
                        image.getBgmAgitImageCategory(), image.getBgmAgitImageLabel()))
                .sum();
        String orderName = "BGM아지트 예약 - " + first.getBgmAgitReservationStartDate();

        // 공통 결제 모듈에 주문 생성 위임
        return paymentService.createOrder(userId, reservationNo, amount, orderName);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<GroupedReservationResponse> getReservationDetail(Long memberId, String role, String startDate, String endDate, Pageable pageable) {
        
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate start = StringUtils.hasText(startDate) ? LocalDate.parse(startDate, fmt) : null;
        LocalDate end   = StringUtils.hasText(endDate)   ? LocalDate.parse(endDate, fmt)   : null;
        boolean isUser = "ROLE_USER".equals(role) || "ROLE_MENTOR".equals(role);
        
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

        // 결제 완료건 영수증 URL 배치 조회 (예약번호별 최신 DONE)
        Map<Long, String> receiptUrls = bgmAgitPaymentRepository.findDoneReceiptUrlsByReservationNos(pageNos);

        // pageNos 순서대로 DTO 만들기
        List<GroupedReservationResponse> content = new ArrayList<>();
        for (Long no : pageNos) {
            List<BgmAgitReservation> list = bucket.get(no);
            if (list == null){
                continue;
            }
            GroupedReservationResponse dto = new GroupedReservationResponse(no,list);
            dto.setReceiptUrl(receiptUrls.get(no));
            content.add(dto);
        }
        
        // 4) total count
        JPAQuery<Long> countQuery = bgmAgitReservationRepository.countReservationsDistinctForDetail(memberId, isUser, start, end);
        
        
        return  PageableExecutionUtils.getPage(content, pageable,countQuery::fetchOne);
    }
    
    @Override
    public ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request, String role) {
        
        
        Long reservationNo = request.getReservationNo();
        String cancelStatus = request.getCancelStatus();
        String approvalStatus = request.getApprovalStatus();
        
        List<BgmAgitReservation> reservations = bgmAgitReservationRepository.findReservationList(reservationNo);
        if (reservations.isEmpty()) {
            throw new ReservationConflictException("존재하지 않는 예약입니다.");
        }

        if ("Y".equalsIgnoreCase(cancelStatus) && !isAdmin(role)) {
            validateUserCancelableReservation(id, reservations);
        }
        
        List<Long> idList = reservations.stream()
                .map(BgmAgitReservation::getBgmAgitReservationId)
                .toList();

        if ("Y".equalsIgnoreCase(cancelStatus)) {
            paymentService.cancelDonePaymentByReservationNo(reservationNo, "예약 취소");
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

        ReservationTalkContext ctx = ReservationTalkContext.of(role, reservations, bizTalkCancel);

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
        return new ApiResponse(200, true, "수정 되었습니다.");
    }

    /** 예약 그룹에서 이미지 중복 제거용 (같은 항목의 여러 시간 슬롯 행을 1개로) */
    private Predicate<BgmAgitImage> distinctByImageId() {
        Set<Long> seen = new HashSet<>();
        return image -> seen.add(image.getBgmAgitImageId());
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
     * 같은 카테고리·같은 메뉴(페이지)여야 하고, 하루 1팀 제한이 있는 항목(G룸)은 합칠 수 없다.
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
                boolean limitedItem = SlotSchedule.maxSelectableSlots(
                        image.getBgmAgitImageCategory(), image.getBgmAgitImageLabel()) != null;
                if (!sameKind || limitedItem) {
                    throw new ReservationConflictException("함께 예약할 수 없는 항목입니다.");
                }
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

        if (userId != null && SlotSchedule.isGroom(category, imageLabel)) {
            boolean alreadyBookedTodayByMe = reserved.stream().anyMatch(r ->
                    Objects.equals(r.getMemberId(), userId) &&
                            !"Y".equals(r.getCancelStatus())
            );
            if (alreadyBookedTodayByMe) {
                return new DayAvailability(List.of(), "G룸은 하루에 1팀당 1개의 예약이 가능하여 다른 시간대의 예약이 불가능 합니다.");
            }
        }

        List<String> availableSlots = new ArrayList<>();
        for (SlotSchedule.Slot slot : SlotSchedule.of(category, imageLabel, d).slots()) {
            if (d.isEqual(today) && slot.end().isBefore(LocalDateTime.now())) {
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

    private void validateUserCancelableReservation(Long memberId, List<BgmAgitReservation> reservations) {
        BgmAgitReservation first = reservations.get(0);
        Long reservationMemberId = first.getBgmAgitMember().getBgmAgitMemberId();
        if (!Objects.equals(reservationMemberId, memberId)) {
            throw new ReservationConflictException("본인의 예약만 취소할 수 있습니다.");
        }

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
        if (!first.getBgmAgitReservationStartDate().isAfter(today)) {
            throw new ReservationConflictException("예약 취소는 예약일 전날까지만 가능합니다.");
        }
    }

    private boolean isAdmin(String role) {
        return "ROLE_ADMIN".equals(role);
    }
}
