package com.bgmagitapi.service.impl;

import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.controller.response.reservation.TimeRange;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.bgmagitapi.util.LunarCalendar;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.bgmagitapi.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.entity.QBgmAgitReservation.bgmAgitReservation;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {

    private final BgmAgitImageRepository  bgmAgitImageRepository;
    
    private final JPAQueryFactory queryFactory;

    @Override
    @Transactional(readOnly = true)
    public BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id,LocalDate date) {
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
        
        return new BgmAgitReservationResponse(timeSlots, prices,label, group);
    }
}
