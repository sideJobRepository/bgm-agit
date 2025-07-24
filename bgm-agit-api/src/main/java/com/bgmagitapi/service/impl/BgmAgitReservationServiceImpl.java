package com.bgmagitapi.service.impl;

import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.controller.response.reservation.TimeRange;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.repository.BgmAgitReservationRepository;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
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

    private final BgmAgitImageRepository  bgmAgitImageRepository;
    
    private final JPAQueryFactory queryFactory;

    @Override
    @Transactional(readOnly = true)
    public BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id,LocalDate date) {
        LocalDate today = date;
        YearMonth yearMonth = YearMonth.from(today);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();
        
        // 오늘 날짜에 해당하는 예약만 조회
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
                        bgmAgitReservation.bgmAgitReservationStartDate.eq(today)
                )
                .fetch();
        
        // 예약 시간 정리
        Map<LocalDate, List<TimeRange>> reservedMap = reservations.stream()
                .map(res -> {
                    LocalDateTime start = LocalDateTime.of(res.getDate(), res.getStartTime());
                    LocalDateTime end = res.getEndTime().isBefore(res.getStartTime())
                            ? LocalDateTime.of(res.getDate().plusDays(1), res.getEndTime())
                            : LocalDateTime.of(res.getDate(), res.getEndTime());
                    return new TimeRange(start, end);
                })
                .collect(Collectors.groupingBy(r -> r.getStart().toLocalDate()));
        
        // 오늘 예약 가능한 시간 계산
        List<String> availableSlots = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalDateTime open = LocalDateTime.of(today, LocalTime.of(13, 0));
        LocalDateTime close = LocalDateTime.of(today.plusDays(1), LocalTime.of(1, 0));
        LocalDateTime cursor = open;
        
        List<TimeRange> reserved = reservedMap.getOrDefault(today, Collections.emptyList())
                .stream().sorted(Comparator.comparing(TimeRange::getStart)).toList();
        
        for (TimeRange r : reserved) {
            while (!cursor.plusHours(1).isAfter(r.getStart())) {
                availableSlots.add(cursor.format(formatter));
                cursor = cursor.plusHours(1);
            }
            if (cursor.isBefore(r.getEnd())) {
                cursor = r.getEnd();
            }
        }
        
        while (!cursor.isAfter(close.minusHours(0))) {
            LocalDateTime checkTime = cursor;  // 별도 변수로 복사 (effectively final)
            
            boolean overlapped = reserved.stream().anyMatch(r ->
                    checkTime.equals(r.getEnd()) &&
                            checkTime.plusHours(1).isAfter(r.getStart())
            );
            
            if (!overlapped) {
                availableSlots.add(checkTime.format(formatter));
            }
            
            cursor = cursor.plusHours(1);
        }
        
        String label = "";
        String group = "";
        
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
        // timeSlots: 오늘 날짜만
        List<BgmAgitReservationResponse.TimeSlotByDate> timeSlots = List.of(
                new BgmAgitReservationResponse.TimeSlotByDate(today, label, group, availableSlots)
        );
        
        //prices: 오늘 ~ 말일까지
        List<BgmAgitReservationResponse.PriceByDate> prices = new ArrayList<>();
        for (LocalDate d = today; !d.isAfter(endOfMonth); d = d.plusDays(1)) {
            int price = (d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY) ? 12000 : 10000;
            prices.add(new BgmAgitReservationResponse.PriceByDate(d, price));
        }
        
        return new BgmAgitReservationResponse(timeSlots, prices);
    }
}
