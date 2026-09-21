package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitHolidayRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitHolidayResponse;
import com.bgmagitapi.origin.entity.BgmAgitHoliday;
import com.bgmagitapi.origin.entity.enumeration.HolidayType;
import com.bgmagitapi.origin.repository.BgmAgitHolidayRepository;
import com.bgmagitapi.origin.service.BgmAgitHolidayService;
import com.bgmagitapi.origin.util.LunarCalendar;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitHolidayServiceImpl implements BgmAgitHolidayService {

    private static final DateTimeFormatter YYYYMMDD = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final BgmAgitHolidayRepository bgmAgitHolidayRepository;

    /**
     * 연도별 법정공휴일 캐시.
     *
     * LunarCalendar 는 음력 변환(ICU)까지 도는 계산이라 조회 한 번에 3개월치를 훑는
     * 예약 캘린더에서 매번 다시 만들면 낭비다. 계산 결과는 연도만 주어지면 고정이라 캐시가 안전하다.
     * (수동 예외는 캐시하지 않는다 — 관리자가 바꾼 즉시 반영돼야 한다.)
     */
    private final Map<Integer, Set<String>> legalHolidayCache = new ConcurrentHashMap<>();

    @Override
    @Transactional(readOnly = true)
    public boolean isWeekendRate(LocalDate date) {
        if (date == null) {
            return false;
        }
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return true;
        }
        return isHoliday(date);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isHoliday(LocalDate date) {
        if (date == null) {
            return false;
        }
        // 수동 예외가 있으면 그게 최종이다. 계산 결과보다 관리자 지정이 우선한다
        Optional<BgmAgitHoliday> manual = bgmAgitHolidayRepository.findByBgmAgitHolidayDate(date);
        if (manual.isPresent()) {
            return manual.get().getBgmAgitHolidayType() == HolidayType.ADD;
        }
        return isLegalHoliday(date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BgmAgitHolidayResponse> getHolidays(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new ValidException("조회 기간이 올바르지 않습니다.");
        }

        Map<LocalDate, BgmAgitHoliday> manualByDate = new java.util.HashMap<>();
        bgmAgitHolidayRepository
                .findByBgmAgitHolidayDateBetweenOrderByBgmAgitHolidayDateAsc(from, to)
                .forEach(h -> manualByDate.put(h.getBgmAgitHolidayDate(), h));

        List<BgmAgitHolidayResponse> result = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            BgmAgitHoliday manual = manualByDate.get(d);
            boolean legal = isLegalHoliday(d);

            if (manual != null) {
                result.add(new BgmAgitHolidayResponse(
                        manual.getBgmAgitHolidayId(),
                        d,
                        manual.getBgmAgitHolidayName(),
                        manual.getBgmAgitHolidayType(),
                        manual.getBgmAgitHolidayType() == HolidayType.ADD));
            } else if (legal) {
                // 자동 계산분. id 가 없으니 화면에서 삭제 버튼을 감추고, 필요하면 EXCLUDE 로 덮게 한다
                result.add(new BgmAgitHolidayResponse(null, d, "법정공휴일", null, true));
            }
        }
        return result;
    }

    @Override
    public ApiResponse saveHoliday(BgmAgitHolidayRequest request, List<String> roles) {
        requireAdmin(roles);

        HolidayType type = request.getType() == null ? HolidayType.ADD : request.getType();
        String name = StringUtils.hasText(request.getName())
                ? request.getName().trim()
                : (type == HolidayType.ADD ? "임시공휴일" : "정상 영업");

        // 날짜 기준 upsert. 같은 날에 ADD 와 EXCLUDE 가 동시에 존재할 수 없다
        bgmAgitHolidayRepository.findByBgmAgitHolidayDate(request.getDate())
                .ifPresentOrElse(
                        existing -> existing.modify(name, type),
                        () -> bgmAgitHolidayRepository.save(
                                new BgmAgitHoliday(request.getDate(), name, type)));

        String effect = type == HolidayType.ADD ? "주말 요금이 적용됩니다." : "평일 요금이 적용됩니다.";
        return new ApiResponse(200, true, request.getDate() + " 저장되었습니다. " + effect);
    }

    @Override
    public ApiResponse deleteHoliday(Long holidayId, List<String> roles) {
        requireAdmin(roles);

        BgmAgitHoliday holiday = bgmAgitHolidayRepository.findById(holidayId)
                .orElseThrow(() -> new ValidException("존재하지 않는 공휴일 설정입니다."));
        bgmAgitHolidayRepository.delete(holiday);
        return new ApiResponse(200, true, "삭제되었습니다. 해당 날짜는 법정공휴일 기준으로 돌아갑니다.");
    }

    /** 법정공휴일 계산 결과(설·추석·대체공휴일 포함). 수동 예외는 보지 않는다 */
    private boolean isLegalHoliday(LocalDate date) {
        Set<String> holidays = legalHolidayCache.computeIfAbsent(
                date.getYear(), year -> new LunarCalendar().getHolidaySet(String.valueOf(year)));
        return holidays.contains(date.format(YYYYMMDD));
    }

    /**
     * URL_RESOURCES 매핑이 없으면 기본 permit 이므로 서비스단에서도 막는다.
     * 요금이 바뀌는 설정이라 손님이 건드리면 안 된다.
     */
    private void requireAdmin(List<String> roles) {
        boolean admin = roles != null && (roles.contains("ROLE_ADMIN") || roles.contains("ADMIN"));
        if (!admin) {
            throw new ValidException("관리자만 사용할 수 있습니다.");
        }
    }
}
