package com.bgmagitapi.service.impl;

import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.entity.QBgmAgitImage;
import com.bgmagitapi.entity.QBgmAgitReservation;
import com.bgmagitapi.repository.BgmAgitReservationRepository;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.bgmagitapi.entity.QBgmAgitImage.*;
import static com.bgmagitapi.entity.QBgmAgitReservation.*;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {

    private final BgmAgitReservationRepository bgmAgitReservationRepository;
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<BgmAgitReservationResponse> getReservation(Long labelGb, String link, LocalDate date) {
        
        // 1. 이번 달의 오늘 ~ 말일 범위
        LocalDate today = date;
        LocalDate endOfMonth = date.withDayOfMonth(date.lengthOfMonth());
        
        // 2. 해당 기간의 예약 데이터 조회
        List<BgmAgitReservationResponse> allList = queryFactory
                .select(
                        Projections.constructor(
                                BgmAgitReservationResponse.class,
                                bgmAgitReservation.bgmAgitReservationStartTime,
                                bgmAgitReservation.bgmAgitReservationEndTime,
                                bgmAgitReservation.bgmAgitReservationStartDate,
                                bgmAgitReservation.bgmAgitReservationEndDate,
                                bgmAgitImage.bgmAgitImageLabel,
                                bgmAgitImage.bgmAgitImageGroups
                        )
                )
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage)
                .where(
                        bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb)
                                .and(bgmAgitImage.bgmAgitMenuLink.eq(link))
                                .and(bgmAgitReservation.bgmAgitReservationStartDate.between(today, endOfMonth))
                ).fetch();
        
        // 3. 빠른 조회를 위한 Map
        Map<LocalDate, BgmAgitReservationResponse> reservationMap = allList.stream()
                .collect(Collectors.toMap(BgmAgitReservationResponse::getStartDate, Function.identity()));
        
        // 4. 오늘 ~ 말일까지 순회하며 price 세팅
        List<BgmAgitReservationResponse> resultList = new ArrayList<>();
        
        for (LocalDate targetDate = today; !targetDate.isAfter(endOfMonth); targetDate = targetDate.plusDays(1)) {
            boolean isWeekend = targetDate.getDayOfWeek() == DayOfWeek.SATURDAY ||
                    targetDate.getDayOfWeek() == DayOfWeek.SUNDAY;
            
            int price = isWeekend ? 12000 : 10000;
            
            BgmAgitReservationResponse item = reservationMap.get(targetDate);
            
            if (item == null) {
                // 예약 정보 없는 날짜 → dummy 객체로 생성
                BgmAgitReservationResponse dummy = new BgmAgitReservationResponse();
                dummy.setStartDate(targetDate);
                dummy.setMonthPrice(price);
                resultList.add(dummy);
            } else {
                item.setMonthPrice(price);
                resultList.add(item);
            }
        }
        
        return resultList;
    }
}
