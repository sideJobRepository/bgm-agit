package com.bgmagitapi.service.impl;

import com.bgmagitapi.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.repository.BgmAgitReservationRepository;
import com.bgmagitapi.service.BgmAgitReservationService;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.bgmagitapi.entity.QBgmAgitImage.bgmAgitImage;
import static com.bgmagitapi.entity.QBgmAgitReservation.bgmAgitReservation;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitReservationServiceImpl implements BgmAgitReservationService {

    private final BgmAgitReservationRepository bgmAgitReservationRepository;

    private final JPAQueryFactory queryFactory;

    @Override
    public List<BgmAgitReservationResponse> getReservation(Long labelGb, String link, LocalDate date) {

        // 오늘 날짜 기준으로 월의 마지막 날 계산
        YearMonth yearMonth = YearMonth.from(date);LocalDate today = date;
        LocalDate endOfMonth = yearMonth.atEndOfMonth();

        // 예약된 데이터 조회
        List<BgmAgitReservationResponse> allList = queryFactory
                .select(Projections.constructor(
                        BgmAgitReservationResponse.class,
                        bgmAgitReservation.bgmAgitReservationStartTime,
                        bgmAgitReservation.bgmAgitReservationEndTime,
                        bgmAgitReservation.bgmAgitReservationStartDate,
                        bgmAgitReservation.bgmAgitReservationEndDate,
                        bgmAgitImage.bgmAgitImageLabel,
                        bgmAgitImage.bgmAgitImageGroups
                ))
                .from(bgmAgitReservation)
                .join(bgmAgitReservation.bgmAgitImage, bgmAgitImage)
                .where(
                        bgmAgitImage.bgmAgitMainMenu.bgmAgitMainMenuId.eq(labelGb),
                        bgmAgitImage.bgmAgitMenuLink.eq(link),
                        bgmAgitReservation.bgmAgitReservationStartDate.between(today, endOfMonth)
                )
                .fetch();

        // 날짜별로 예약 데이터 그룹핑
        Map<LocalDate, List<BgmAgitReservationResponse>> reservationMap = allList.stream()
                .collect(Collectors.groupingBy(BgmAgitReservationResponse::getStartDate));

        List<BgmAgitReservationResponse> resultList = new ArrayList<>();

        // 오늘 ~ 말일까지 반복
        for (LocalDate targetDate = today; !targetDate.isAfter(endOfMonth); targetDate = targetDate.plusDays(1)) {
            DayOfWeek dayOfWeek = targetDate.getDayOfWeek();
            boolean isWeekend = (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY);
            int price = isWeekend ? 12000 : 10000;

            List<BgmAgitReservationResponse> reservations = reservationMap.get(targetDate);

            if (reservations != null && !reservations.isEmpty()) {
                for (BgmAgitReservationResponse res : reservations) {
                    res.setMonthPrice(price);
                    resultList.add(res);
                }
            } else {
                BgmAgitReservationResponse dummy = BgmAgitReservationResponse.builder()
                        .startDate(targetDate)
                        .monthPrice(price)
                        .build();
                resultList.add(dummy);
            }
        }

        return resultList;
    }
}
