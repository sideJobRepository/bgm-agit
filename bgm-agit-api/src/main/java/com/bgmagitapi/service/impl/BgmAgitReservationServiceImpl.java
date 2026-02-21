package com.bgmagitapi.service.impl;

import com.bgmagitapi.advice.exception.ReservationConflictException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.controller.response.reservation.TimeRange;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.event.dto.ReservationTalkEvent;
import com.bgmagitapi.event.dto.ReservationWaitingEvent;
import com.bgmagitapi.event.dto.TalkAction;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitReservationRepository;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.bgmagitapi.service.response.BizTalkCancel;
import com.bgmagitapi.service.response.ReservationTalkContext;
import com.bgmagitapi.util.LunarCalendar;
import com.bgmagitapi.util.SlotSchedule;
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
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {
    
    private final BgmAgitImageRepository bgmAgitImageRepository;
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitReservationRepository bgmAgitReservationRepository;
    
    private final ApplicationEventPublisher eventPublisher;
    
    @Override
    @Transactional(readOnly = true)
    public BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id, LocalDate date) {
        Authentication authentication = SecurityContextHolder.getContextHolderStrategy().getContext().getAuthentication();
        Long userId = (authentication instanceof JwtAuthenticationToken bearerAuth)
                ? ((Jwt) bearerAuth.getPrincipal()).getClaim("id")
                : null;
        LocalDate today = date;
        LocalDate endOfYear = today.plusMonths(3);
        String label = "", group = "";
        Integer minPeople = null, maxPeople = null;
        // 1. 예약 정보 조회
        // 1. 예약 정보 조회 (Y: 확정 / N: 대기)
        List<ReservedTimeDto> reservations = bgmAgitReservationRepository.findReservations(labelGb, link, id, today, endOfYear);
        BgmAgitImage bgmAgitImage = bgmAgitImageRepository.findById(id).orElseThrow(() -> new RuntimeException("존재 하지않는 이미지 입니다."));
        // 2. 예약 시간 Map<날짜, List<TimeRange>> 으로 변환
        Map<LocalDate, List<TimeRange>> reservedMap = ReservedTimeDto.groupedReservation(reservations);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        // 3. 날짜별 시간 슬롯 생성
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
            SlotSchedule schedule = SlotSchedule.of(bgmAgitImage.getBgmAgitImageCategory() , bgmAgitImage.getBgmAgitImageLabel(), d);
            
            LocalDateTime open = schedule.open();
            LocalDateTime close = schedule.close();
            int slotIntervalHours = schedule.intervalHours();
            
            LocalDateTime cursor = open;
            List<String> availableSlots = new ArrayList<>();
            List<TimeRange> reserved = reservedMap
                    .getOrDefault(d, Collections.emptyList())
                    .stream()
                    .sorted(Comparator.comparing(TimeRange::getStart))
                    .toList();
            
            if (userId != null && SlotSchedule.isGroom(bgmAgitImage.getBgmAgitImageCategory(), bgmAgitImage.getBgmAgitImageLabel())) {
                boolean alreadyBookedTodayByMe = reserved.stream().anyMatch(r ->
                        Objects.equals(r.getMemberId(), userId) &&
                                !"Y".equals(r.getCancelStatus())
                );
                if (alreadyBookedTodayByMe) {
                    timeSlots.add(new BgmAgitReservationResponse.TimeSlotByDate(d, List.of(),"G룸은 하루에 1팀당 1개의 예약이 가능하여 다른 시간대의 예약이 불가능 합니다."));
                    continue;
                }
            }
            
            while (cursor.isBefore(close)) {
                LocalDateTime slotStart = cursor;
                LocalDateTime slotEnd = cursor.plusHours(slotIntervalHours);
                
                if (d.isEqual(today) && slotEnd.isBefore(LocalDateTime.now())) {
                    cursor = cursor.plusHours(slotIntervalHours);
                    continue;
                }
                
                boolean overlapped = reserved.stream()
                        .anyMatch(r -> r.isOverlapping(slotStart, slotEnd, userId));
                if (!overlapped) {
                    availableSlots.add(slotStart.format(formatter));
                }
                if (SlotSchedule.isMahjongRental(bgmAgitImage.getBgmAgitImageCategory()) && slotStart.format(formatter).equals("01:00")) {
                    availableSlots.remove(slotStart.format(formatter));
                }
                cursor = cursor.plusHours(slotIntervalHours);
            }
            if (!availableSlots.isEmpty()) {
                if (!reservations.isEmpty()) {
                    ReservedTimeDto dto = reservations.get(0);
                    label = dto.getLabel();
                    group = dto.getGroup();
                    minPeople = dto.getMinPeople();
                    maxPeople = dto.getMaxPeople();
                } else {
                    BgmAgitImage image = bgmAgitImageRepository.findById(id).orElse(null);
                    if (image != null) {
                        label = image.getBgmAgitImageLabel();
                        group = image.getBgmAgitImageGroups();
                        minPeople = image.getBgmAgitImageMinPeople();
                        maxPeople = image.getBgmAgitImageMaxPeople();
                    }
                }
            }
            
            timeSlots.add(new BgmAgitReservationResponse.TimeSlotByDate(d, availableSlots,null));
        }

        // 4. 공휴일/주말 가격 계산
        Set<String> holidaySet = new HashSet<>();
        
        int startYear = today.getYear();
        int endYear = endOfYear.getYear();
        
        for (int y = startYear; y <= endYear; y++) {
            holidaySet.addAll(
                    new LunarCalendar().getHolidaySet(String.valueOf(y))
            );
        }
        
        DateTimeFormatter formatterYY = DateTimeFormatter.ofPattern("yyyyMMdd");
        
        List<BgmAgitReservationResponse.PriceByDate> prices = new ArrayList<>();
        
        for (LocalDate d = today; !d.isAfter(endOfYear); d = d.plusDays(1)) {
            String dateStr = d.format(formatterYY);
            boolean isWeekend = d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean isHoliday = holidaySet.contains(dateStr);
            int price = (isWeekend || isHoliday) ? 4000 : 3000;
            if (SlotSchedule.isMahjongRental(bgmAgitImage.getBgmAgitImageCategory())) {
                price = 40000;
            }
            prices.add(new BgmAgitReservationResponse.PriceByDate(d, price, isWeekend || isHoliday));
        }
        
        return new BgmAgitReservationResponse(timeSlots, prices, label, group,minPeople, maxPeople);
        
    }
    
    @Override
    public ApiResponse createReservation(BgmAgitReservationCreateRequest request, Long userId) {
        Long imageId = request.getBgmAgitImageId();
        BgmAgitImage  bgmAgitImage = bgmAgitImageRepository.findById(imageId).orElseThrow(() -> new RuntimeException("존재하지 않는 이미지 입니다."));
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
        
        // 예약 기본 정보 조회
        BgmAgitMember member = bgmAgitMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        String reservationType = request.getBgmAgitReservationType();
        
        // 기존 예약 조회
        List<BgmAgitReservation> existingReservations = bgmAgitReservationRepository.findExistingReservations(bgmAgitImage, kstDate, "N");
        
        // 중복된 시간대 구성 (Set으로 빠르게 비교)
        Set<String> existingTimeSlots = existingReservations.stream()
                .filter(r ->
                        "Y".equals(r.getBgmAgitReservationApprovalStatus()) ||
                                (
                                        "N".equals(r.getBgmAgitReservationApprovalStatus()) &&
                                                Objects.equals(r.getBgmAgitMember().getBgmAgitMemberId(), userId)
                                )
                )
                .map(r -> r.getBgmAgitReservationStartTime() + "-" + r.getBgmAgitReservationEndTime())
                .collect(Collectors.toSet());
        Long maxReservationNo = bgmAgitReservationRepository.findMaxReservationNo();
        maxReservationNo = (maxReservationNo == null) ? 1L : maxReservationNo + 1L;
        // 신규 예약 생성
        List<BgmAgitReservation> list = new ArrayList<>();
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
                throw new ReservationConflictException("이미 예약된 시간대입니다: " + slotKey);
            }
            
            BgmAgitReservation reservation = new BgmAgitReservation(
                    member, bgmAgitImage, reservationType, startTime, endTime, kstDate,maxReservationNo,people,reservationRequest
            );
            bgmAgitReservationRepository.save(reservation);
            list.add(reservation);
        }
        
        eventPublisher.publishEvent(new ReservationWaitingEvent(member,bgmAgitImage,list));
        return new ApiResponse(200, true, "예약이 완료되었습니다.");
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

        // pageNos 순서대로 DTO 만들기
        List<GroupedReservationResponse> content = new ArrayList<>();
        for (Long no : pageNos) {
            List<BgmAgitReservation> list = bucket.get(no);
            if (list == null){
                continue;
            }
            GroupedReservationResponse dto = new GroupedReservationResponse(no,list);
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
        
        List<Long> idList = reservations.stream()
                .map(BgmAgitReservation::getBgmAgitReservationId)
                .toList();
        
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
}
