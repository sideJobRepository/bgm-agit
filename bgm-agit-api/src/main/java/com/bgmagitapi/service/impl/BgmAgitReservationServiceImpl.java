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
import com.bgmagitapi.entity.QBgmAgitMember;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitReservationRepository;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.bgmagitapi.util.LunarCalendar;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
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

import static com.bgmagitapi.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.entity.QBgmAgitReservation.bgmAgitReservation;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {
    
    private final BgmAgitImageRepository bgmAgitImageRepository;
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    
    private final BgmAgitReservationRepository bgmAgitReservationRepository;
    
    private final JPAQueryFactory queryFactory;
    
    
    @Override
    @Transactional(readOnly = true)
    public BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id, LocalDate date) {
        Authentication authentication = SecurityContextHolder.getContextHolderStrategy().getContext().getAuthentication();
        final Long userId = (authentication instanceof JwtAuthenticationToken bearerAuth)
                ? ((Jwt) bearerAuth.getPrincipal()).getClaim("id")
                : null;
        LocalDate today = date;
        LocalDate endOfYear = LocalDate.of(today.getYear(), 12, 31);
        String label = "", group = "";
        // 1. 예약 정보 조회
        // 1. 예약 정보 조회 (Y: 확정 / N: 대기)
        List<ReservedTimeDto> reservations = queryFactory
                .select(Projections.constructor(
                        ReservedTimeDto.class,
                        bgmAgitReservation.bgmAgitReservationStartDate,
                        bgmAgitReservation.bgmAgitReservationStartTime,
                        bgmAgitReservation.bgmAgitReservationEndTime,
                        bgmAgitImage.bgmAgitImageLabel,
                        bgmAgitImage.bgmAgitImageGroups,
                        bgmAgitReservation.bgmAgitReservationApprovalStatus,
                        bgmAgitReservation.bgmAgitMember.bgmAgitMemberId,
                        bgmAgitReservation.bgmAgitReservationCancelStatus
                ))
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage)
                .where(
                        bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb),
                        bgmAgitImage.bgmAgitMenuLink.eq(link),
                        bgmAgitImage.bgmAgitImageId.eq(id),
                        bgmAgitReservation.bgmAgitReservationApprovalStatus.in("Y", "N"), // 확정 포함
                        bgmAgitReservation.bgmAgitReservationStartDate.between(today, endOfYear)
                )
                .fetch();

        // 2. 예약 시간 Map<날짜, List<TimeRange>> 으로 변환
        Map<LocalDate, List<TimeRange>> reservedMap = reservations.stream()
                .map(res -> {
                    LocalDateTime start = LocalDateTime.of(res.getDate(), res.getStartTime());
                    LocalDateTime end = res.getEndTime().isBefore(res.getStartTime())
                            ? LocalDateTime.of(res.getDate().plusDays(1), res.getEndTime())
                            : LocalDateTime.of(res.getDate(), res.getEndTime());
                    return new TimeRange(start, end, res.getApprovalStatus(), res.getMemberId() , res.getCancelStatus());
                })
                .collect(Collectors.groupingBy(r -> r.getStart().toLocalDate()));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        // 3. 날짜별 시간 슬롯 생성
        List<BgmAgitReservationResponse.TimeSlotByDate> timeSlots = new ArrayList<>();
        
        for (LocalDate d = today; !d.isAfter(endOfYear); d = d.plusDays(1)) {
            LocalDateTime open = LocalDateTime.of(d, LocalTime.of(13, 0));
            LocalDateTime close = LocalDateTime.of(d.plusDays(1), LocalTime.of(2, 0));
            LocalDateTime cursor = open;
            
            List<String> availableSlots = new ArrayList<>();
            List<TimeRange> reserved = reservedMap.getOrDefault(d, Collections.emptyList())
                    .stream().sorted(Comparator.comparing(TimeRange::getStart)).toList();
            
            int slotIntervalHours = (id != null && id == 18) ? 3 : 1;
            
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
                
                cursor = cursor.plusHours(slotIntervalHours);
            }
            
            if (!availableSlots.isEmpty()) {
                if (!reservations.isEmpty()) {
                    ReservedTimeDto dto = reservations.get(0);
                    label = dto.getLabel();
                    group = dto.getGroup();
                } else {
                    BgmAgitImage image = bgmAgitImageRepository.findById(id).orElse(null);
                    if (image != null) {
                        label = image.getBgmAgitImageLabel();
                        group = image.getBgmAgitImageGroups();
                    }
                }
            }
            
            timeSlots.add(new BgmAgitReservationResponse.TimeSlotByDate(d, availableSlots));
        }

        // 4. 공휴일/주말 가격 계산
        Set<String> holidaySet = new LunarCalendar().getHolidaySet(String.valueOf(today.getYear()));
        DateTimeFormatter formatterYY = DateTimeFormatter.ofPattern("yyyyMMdd");
        
        List<BgmAgitReservationResponse.PriceByDate> prices = new ArrayList<>();
        
        for (LocalDate d = today; !d.isAfter(endOfYear); d = d.plusDays(1)) {
            String dateStr = d.format(formatterYY);
            boolean isWeekend = d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean isHoliday = holidaySet.contains(dateStr);
            int price = (isWeekend || isHoliday) ? 4000 : 3000;
            
            prices.add(new BgmAgitReservationResponse.PriceByDate(d, price, isWeekend || isHoliday));
        }
        
        return new BgmAgitReservationResponse(timeSlots, prices, label, group);
        
    }
    
    @Override
    public ApiResponse createReservation(BgmAgitReservationCreateRequest request, Long userId) {
        List<String> timeList = request.getReservationExpandedTimeSlots();

        // 날짜 보정
        String dateStr = request.getBgmAgitReservationStartDate(); // "2025-07-27T15:00:00.000Z"
        Instant instant = Instant.parse(dateStr);
        LocalDate kstDate = instant.atZone(ZoneId.of("Asia/Seoul")).toLocalDate();
        
        // 예약 기본 정보 조회
        BgmAgitMember member = bgmAgitMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        BgmAgitImage image = bgmAgitImageRepository.findById(request.getBgmAgitImageId())
                .orElseThrow(() -> new RuntimeException("Not Found Image Id"));
        String reservationType = request.getBgmAgitReservationType();
        
        // 기존 예약 조회
        List<BgmAgitReservation> existingReservations = bgmAgitReservationRepository
                .findByBgmAgitImageAndBgmAgitReservationStartDateAndBgmAgitReservationCancelStatus(
                        image, kstDate, "N"
                );
        
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
                    member, image, reservationType, startTime, endTime, kstDate,maxReservationNo
            );
            bgmAgitReservationRepository.save(reservation);
        }
        
        
        return new ApiResponse(200, true, "예약이 완료되었습니다.");
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<GroupedReservationResponse> getReservationDetail(Long memberId, String role, String startDate, String endDate, Pageable pageable) {
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member Not Found"));
        
        BooleanBuilder booleanBuilder = new BooleanBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        if ("ROLE_USER".equals(role)) {
            booleanBuilder.and(bgmAgitReservation.bgmAgitMember.bgmAgitMemberId.eq(bgmAgitMember.getBgmAgitMemberId()));
        }
        
        if (StringUtils.hasText(startDate) && StringUtils.hasText(endDate)) {
            // 둘 다 있을 때는 between
            LocalDate start = LocalDate.parse(startDate, formatter);
            LocalDate end = LocalDate.parse(endDate, formatter);
            booleanBuilder.and(bgmAgitReservation.bgmAgitReservationStartDate.between(start, end));
        } else {
            // startDate만 있을 때
            if (StringUtils.hasText(startDate)) {
                LocalDate start = LocalDate.parse(startDate, formatter);
                booleanBuilder.and(bgmAgitReservation.bgmAgitReservationStartDate.goe(start));
            }
            // endDate만 있을 때
            if (StringUtils.hasText(endDate)) {
                LocalDate end = LocalDate.parse(endDate, formatter);
                booleanBuilder.and(bgmAgitReservation.bgmAgitReservationStartDate.loe(end));
            }
        }
        
        // 1. 실제 데이터 가져오기
        QBgmAgitMember qBgmAgitMember = QBgmAgitMember.bgmAgitMember;
        List<BgmAgitReservation> reservations = queryFactory
                .select(bgmAgitReservation)
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitMember , qBgmAgitMember).fetchJoin()
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage).fetchJoin()
                .where(booleanBuilder)
                .orderBy(bgmAgitReservation.bgmAgitReservationNo.desc()) // 예약 번호 기준 정렬
                .fetch();
        
        // 2. 총 개수
        Long total = queryFactory
                .select(bgmAgitReservation.bgmAgitReservationNo.countDistinct())
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitMember, qBgmAgitMember)
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage)
                .where(booleanBuilder)
                .fetchOne();
        if (total == null) total = 0L;
        
        // 3. 그룹핑
        Map<Long, List<BgmAgitReservation>> grouped = reservations.stream()
                .collect(Collectors.groupingBy(BgmAgitReservation::getBgmAgitReservationNo));
        
        // 4. 그룹을 응답용 DTO로 변환
        List<GroupedReservationResponse> groupedResponses = grouped.entrySet().stream()
                .sorted(Map.Entry.<Long, List<BgmAgitReservation>>comparingByKey().reversed())// reservationNo 기준 정렬
                .map(entry -> {
                    GroupedReservationResponse dto = new GroupedReservationResponse();
                    dto.setReservationNo(entry.getKey());
                    
                    List<GroupedReservationResponse.TimeSlot> slots = entry.getValue().stream()
                            .map(r -> new GroupedReservationResponse.TimeSlot(
                                    r.getBgmAgitReservationStartTime().toString(),
                                    r.getBgmAgitReservationEndTime().toString()
                            ))
                            .collect(Collectors.toList());
                    
                    dto.setTimeSlots(slots);
                    dto.setReservationDate(entry.getValue().get(0).getBgmAgitReservationStartDate());
                    dto.setApprovalStatus(entry.getValue().get(0).getBgmAgitReservationApprovalStatus());
                    dto.setCancelStatus(entry.getValue().get(0).getBgmAgitReservationCancelStatus());
                    dto.setReservationMemberName(entry.getValue().get(0).getBgmAgitMember().getBgmAgitMemberName());
                    dto.setReservationAddr(entry.getValue().get(0).getBgmAgitImage().getBgmAgitImageLabel());
                    return dto;
                })
                .collect(Collectors.toList());
        
        // 5. 페이지네이션
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), groupedResponses.size());
        List<GroupedReservationResponse> pageContent = groupedResponses.subList(start, end);
        
        return new PageImpl<>(pageContent, pageable, total);
    }
    
    @Override
    public ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request) {
        Long reservationNo = request.getReservationNo();
        String cancelStatus = request.getCancelStatus();
        String approvalStatus = request.getApprovalStatus();
        
        List<BgmAgitReservation> list = queryFactory
                .selectFrom(bgmAgitReservation)
                .where(bgmAgitReservation.bgmAgitReservationNo.eq(reservationNo))
                .fetch();
        
        List<Long> idList = list.stream()
                .map(BgmAgitReservation::getBgmAgitReservationId)
                .toList();
        
        if (!idList.isEmpty()) {
            bgmAgitReservationRepository.bulkUpdateCancelAndApprovalStatus(
                    cancelStatus, approvalStatus, idList
            );
        }
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
}
