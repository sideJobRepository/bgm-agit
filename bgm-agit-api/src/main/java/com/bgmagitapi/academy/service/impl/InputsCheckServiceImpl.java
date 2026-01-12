package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.response.InputsCheckDateHeader;
import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCheckRowResponse;
import com.bgmagitapi.academy.entity.ProgressInputs;
import com.bgmagitapi.academy.repository.InputsRepository;
import com.bgmagitapi.academy.service.InputsCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class InputsCheckServiceImpl implements InputsCheckService {
    
    private final InputsRepository inputsRepository;
    
    
    @Override
    public InputsCheckGetResponse getInputsChecks(String className) {
        // 1) weekGroups 생성 (기존 createJanuaryHeader에서 뽑거나 그대로 써도 됨)
        InputsCheckDateHeader tmpHeader = createJanuaryHeader(2026);
    
        // 2) rows 생성 (weekGroups를 쓰든 header를 쓰든 기존 로직 그대로)
        List<InputsCheckRowResponse> rows = buildCheckRows(className, tmpHeader);
    
        // 3)  rows 포함한 최종 header 생성
        InputsCheckDateHeader header = new InputsCheckDateHeader(
                tmpHeader.getMonth(),
                tmpHeader.getWeekGroups(),
                rows
        );
    
        // 4) response는 header만
        return new InputsCheckGetResponse(header);
    }
    
    private InputsCheckDateHeader createJanuaryHeader(int year) {
    
        YearMonth yearMonth = YearMonth.of(year, 1);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
    
        List<InputsCheckDateHeader.WeekGroup> groups = new ArrayList<>();
    
        LocalDate cursor = start;
    
        while (!cursor.isAfter(end)) {
    
            DayOfWeek dow = cursor.getDayOfWeek();
    
            // 일요일 스킵
            if (dow == DayOfWeek.SUNDAY) {
                cursor = cursor.plusDays(1);
                continue;
            }
    
            // 월 / 수 / 금 시작
            if (dow == DayOfWeek.MONDAY
                    || dow == DayOfWeek.WEDNESDAY
                    || dow == DayOfWeek.FRIDAY) {
    
                LocalDate next = cursor.plusDays(1);
    
                if (next.isAfter(end) || next.getDayOfWeek() == DayOfWeek.SUNDAY) {
                    groups.add(
                            new InputsCheckDateHeader.WeekGroup(
                                    cursor,
                                    cursor,
                                    formatLabel(cursor, cursor)
                            )
                    );
                } else {
                    groups.add(
                            new InputsCheckDateHeader.WeekGroup(
                                    cursor,
                                    next,
                                    formatLabel(cursor, next)
                            )
                    );
                }
            }
    
            cursor = cursor.plusDays(1);
        }
    
        return new InputsCheckDateHeader(1, groups,   new ArrayList<>());
    }
    
private String formatLabel(LocalDate start, LocalDate end) {
    if (start.equals(end)) {
        return start.getMonthValue() + "/" + start.getDayOfMonth()
                + "(" + start.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.KOREAN) + ")";
    }
    return start.getMonthValue() + "/" + start.getDayOfMonth()
            + "(" + start.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.KOREAN) + ")~"
            + end.getMonthValue() + "/" + end.getDayOfMonth()
            + "(" + end.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.KOREAN) + ")";
}

    
    private List<InputsCheckRowResponse> buildCheckRows(
            String className,
            InputsCheckDateHeader header
    ) {
    
        List<ProgressInputs> rows =
                inputsRepository.findByInputsCheck(className);
    
        Map<String, InputsCheckRowResponse> resultMap = new LinkedHashMap<>();
    
        for (ProgressInputs row : rows) {
    
            String gubun =
                    row.getCurriculumProgress().getProgressGubun();
    
            InputsCheckRowResponse parent =
                    resultMap.computeIfAbsent(
                            gubun,
                            key -> createEmptyRow(key, header)
                    );
    
            LocalDate date = row.getInputs().getInputsDate();
    
            InputsCheckRowResponse.CheckItem item =
                    new InputsCheckRowResponse.CheckItem(
                            date,
                            row.getUnit() + " " + row.getPages()
                    );
    
            //  WeekGroup 안에 직접 넣는다
            for (InputsCheckRowResponse.WeekCheck week : parent.getWeeks()) {
    
                if (date.equals(week.getStartDate())) {
                    week.setStartItem(item);
                    break;
                }
    
                if (date.equals(week.getEndDate())) {
                    week.setEndItem(item);
                    break;
                }
            }
        }
    
        return new ArrayList<>(resultMap.values());
    }
  
    
    private InputsCheckRowResponse createEmptyRow(
            String gubun,
            InputsCheckDateHeader header
    ) {
        List<InputsCheckRowResponse.WeekCheck> weeks = new ArrayList<>();
    
        for (InputsCheckDateHeader.WeekGroup group : header.getWeekGroups()) {
            weeks.add(
                    new InputsCheckRowResponse.WeekCheck(
                            group.getStartDate(),
                            group.getEndDate(),
                            null,
                            null
                    )
            );
        }
    
        return new InputsCheckRowResponse(gubun, weeks);
    }
    
    
    private void ensureSize(List<InputsCheckRowResponse.CheckItem> list, int size) {
        while (list.size() < size) {
            list.add(null);
        }
    }
    
    
    
}
