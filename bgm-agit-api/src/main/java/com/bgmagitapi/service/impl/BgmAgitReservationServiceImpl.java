package com.bgmagitapi.service.impl;

import com.bgmagitapi.advice.exception.ReservationConflictException;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitReservationDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.controller.response.reservation.TimeRange;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.repository.BgmAgitReservationRepository;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.bgmagitapi.util.LunarCalendar;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        LocalDate today = date;
        LocalDate endOfYear = LocalDate.of(today.getYear(), 12, 31);
        String label = "", group = "";
        // 1. 예약 정보 조회
        List<ReservedTimeDto> reservations = queryFactory
                .select(Projections.constructor(
                        ReservedTimeDto.class,
                        bgmAgitReservation.bgmAgitReservationStartDate,
                        bgmAgitReservation.bgmAgitReservationStartTime,
                        bgmAgitReservation.bgmAgitReservationEndTime,
                        bgmAgitImage.bgmAgitImageLabel,
                        bgmAgitImage.bgmAgitImageGroups
                ))
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage)
                .where(
                        bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb),
                        bgmAgitImage.bgmAgitMenuLink.eq(link),
                        bgmAgitImage.bgmAgitImageId.eq(id),
                        bgmAgitReservation.bgmAgitReservationCancelStatus.eq("N"),
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
                    return new TimeRange(start, end);
                })
                .collect(Collectors.groupingBy(r -> r.getStart().toLocalDate()));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        
        // 3. 날짜별 시간 슬롯 생성 (오늘~연말까지)
        List<BgmAgitReservationResponse.TimeSlotByDate> timeSlots = new ArrayList<>();
        for (LocalDate d = today; !d.isAfter(endOfYear); d = d.plusDays(1)) {
            LocalDateTime open = LocalDateTime.of(d, LocalTime.of(13, 0));
            LocalDateTime close = LocalDateTime.of(d.plusDays(1), LocalTime.of(1, 0));
            LocalDateTime cursor = open;
            
            List<String> availableSlots = new ArrayList<>();
            List<TimeRange> reserved = reservedMap.getOrDefault(d, Collections.emptyList())
                    .stream().sorted(Comparator.comparing(TimeRange::getStart)).toList();
            
            // id가 18이면 G룸임 G룸은 최소 대여 시간이 3시간, 아니면 1시간
            int slotIntervalHours = (id != null && id == 18) ? 3 : 1;
            
            while (cursor.isBefore(close)) {
                LocalDateTime slotStart = cursor;
                LocalDateTime slotEnd = cursor.plusHours(slotIntervalHours);
                
                boolean overlapped = reserved.stream().anyMatch(r ->
                        slotStart.isBefore(r.getEnd()) && slotEnd.isAfter(r.getStart())
                );
                
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
        
        // 공휴일 Set 준비 (형식: yyyyMMdd)
        Set<String> holidaySet = new LunarCalendar().getHolidaySet(String.valueOf(today.getYear()));
        DateTimeFormatter formatterYY = DateTimeFormatter.ofPattern("yyyyMMdd");
        
        // 오늘~연말까지 날짜별 가격 계산
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
                .findByBgmAgitImageAndBgmAgitReservationStartDate(image, kstDate);
        
        // 중복된 시간대 구성 (Set으로 빠르게 비교)
        Set<String> existingTimeSlots = existingReservations.stream()
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
    public Page<GroupedReservationResponse> getReservationDetail(Long memberId, Pageable pageable) {
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member Not Found"));
        
        // 1. 실제 데이터 가져오기 (QueryDSL)
        List<BgmAgitReservation> reservations = queryFactory
                .selectFrom(bgmAgitReservation)
                .where(bgmAgitReservation.bgmAgitMember.bgmAgitMemberId.eq(bgmAgitMember.getBgmAgitMemberId()))
                .orderBy(bgmAgitReservation.bgmAgitReservationNo.asc()) // 예약 번호 기준 정렬
                .fetch();
        
        // 2. 총 개수
        Long total = queryFactory
                .select(bgmAgitReservation.bgmAgitReservationNo.countDistinct())
                .from(bgmAgitReservation)
                .where(bgmAgitReservation.bgmAgitMember.bgmAgitMemberId.eq(bgmAgitMember.getBgmAgitMemberId()))
                .fetchOne();
        if (total == null) total = 0L;
        
        // 3. 그룹핑
        Map<Long, List<BgmAgitReservation>> grouped = reservations.stream()
                .collect(Collectors.groupingBy(BgmAgitReservation::getBgmAgitReservationNo));
        
        // 4. 그룹을 응답용 DTO로 변환
        List<GroupedReservationResponse> groupedResponses = grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // reservationNo 기준 정렬
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
        
        
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        
        return null;
    }
}
