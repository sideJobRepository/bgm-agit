package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.response.InputsCheckDateHeader;
import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;
import com.bgmagitapi.academy.entity.CurriculumCont;
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
    public List<InputsCheckGetResponse> getInputsChecks(String className) {
  
        InputsCheckDateHeader header = createJanuaryHeader(2026);
        //List<InputsCheckRowResponse> rows = buildCheckRows(className);
    
        //return new InputsCheckGetResponse(header, rows);
        return null;
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
    
        return new InputsCheckDateHeader(1, groups);
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
    
    
}
