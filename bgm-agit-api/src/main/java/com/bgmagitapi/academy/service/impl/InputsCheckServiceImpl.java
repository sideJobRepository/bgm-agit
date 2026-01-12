package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.response.InputsCheckClassResponse;
import com.bgmagitapi.academy.dto.response.InputsCheckDateHeader;
import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCheckRowResponse;
import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.entity.ProgressInputs;
import com.bgmagitapi.academy.repository.CurriculumContRepository;
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
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class InputsCheckServiceImpl implements InputsCheckService {
    
    private final InputsRepository inputsRepository;
    private final CurriculumContRepository curriculumContRepository;
    
    
    @Override
    public InputsCheckGetResponse getInputsChecks() {
        int year = LocalDate.now().getYear();
        
        List<InputsCheckDateHeader> headers = createYearHeaders(year);
        for (int i = 0; i < headers.size(); i++) {
            
            InputsCheckDateHeader header = headers.get(i);
            
            List<InputsCheckClassResponse> rows =
                    buildCheckClasses(header);
            headers.set(
                    i,
                    new InputsCheckDateHeader(
                            header.getMonth(),
                            header.getWeekGroups(),
                            rows
                    )
            );
        }
        
        return new InputsCheckGetResponse(headers);
    }
    
    private InputsCheckDateHeader createMonthHeader(int year, int month) {
        
        YearMonth yearMonth = YearMonth.of(year, month);
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
                    groups.add(new InputsCheckDateHeader.WeekGroup(
                            cursor,
                            cursor,
                            formatLabel(cursor, cursor)
                    ));
                } else {
                    groups.add(new InputsCheckDateHeader.WeekGroup(
                            cursor,
                            next,
                            formatLabel(cursor, next)
                    ));
                }
            }
            
            cursor = cursor.plusDays(1);
        }
        
        // rows는 여기서 모름 → 빈 리스트
        return new InputsCheckDateHeader(
                month,
                groups,
                new ArrayList<>()
        );
    }
    
    private List<InputsCheckDateHeader> createYearHeaders(int year) {
        
        List<InputsCheckDateHeader> headers = new ArrayList<>();
        
        for (int month = 1; month <= 12; month++) {
            headers.add(createMonthHeader(year, month));
        }
        
        return headers;
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
    private List<InputsCheckClassResponse> buildCheckClasses(
            InputsCheckDateHeader header
    ) {
        List<ProgressInputs> rows =
                inputsRepository.findByInputsCheck();
    
        // 1. (반 → 진도구분) 구조로 그룹핑
        Map<String, Map<String, InputsCheckRowResponse>> classMap = new LinkedHashMap<>();
        Map<Long, List<CurriculumCont>> contMap =
                curriculumContRepository.findAll()
                        .stream()
                        .collect(Collectors.groupingBy(
                                cc -> cc.getCurriculumProgress().getId()
                        ));
        for (ProgressInputs row : rows) {
    
            String className =
                    row.getCurriculumProgress()
                       .getCurriculum()
                       .getClasses();
            
            String progressGubun =
                    row.getCurriculumProgress()
                       .getProgressGubun();
            
            String teacher = row.getInputs().getTeacher();
            CurriculumProgress curriculumProgress = row.getCurriculumProgress();
            LocalDate date = row.getInputs().getInputsDate();
            int month = date.getMonthValue();
            String curriculumContent = "";
            
            List<CurriculumCont> contList =
                    contMap.get(curriculumProgress.getId());
            
            if (contList != null) {
                curriculumContent =
                        contList.stream()
                                .filter(cc ->
                                        month >= cc.getStartMonths()
                                     && month <= cc.getEndMonths()
                                )
                                .map(CurriculumCont::getCont)
                                .collect(Collectors.joining(", "));
            }
            Map<String, InputsCheckRowResponse> progressMap =
                    classMap.computeIfAbsent(
                            className,
                            k -> new LinkedHashMap<>()
                    );
    
            InputsCheckRowResponse parent =
                    progressMap.computeIfAbsent(
                            progressGubun,
                            k -> createEmptyRow(teacher,className, progressGubun, header)
                    );
            
    
            InputsCheckRowResponse.CheckItem item =
                    new InputsCheckRowResponse.CheckItem(
                            date,
                            curriculumContent,
                            row.getTextBook() + " " + row.getUnit() + " " + row.getPages()
                    );
    
            for (InputsCheckRowResponse.WeekCheck week : parent.getWeeks()) {
                boolean matched = false;
    
                if (date.equals(week.getStartDate())) {
                    week.setStartItem(item);
                    matched = true;
                }
    
                if (date.equals(week.getEndDate())) {
                    week.setEndItem(item);
                    matched = true;
                }
    
                if (matched) break;
            }
        }
    
        // 2. week 비어있는 것 제거 + response 변환
        List<InputsCheckClassResponse> result = new ArrayList<>();
    
        for (Map.Entry<String, Map<String, InputsCheckRowResponse>> entry : classMap.entrySet()) {
    
            List<InputsCheckRowResponse> classRows =
                    new ArrayList<>(entry.getValue().values());
    
            classRows.forEach(r ->
                    r.getWeeks().removeIf(
                            w -> w.getStartItem() == null && w.getEndItem() == null
                    )
            );
    
            result.add(
                    new InputsCheckClassResponse(
                            entry.getKey(),
                            classRows
                    )
            );
        }
    
        return result;
    }

    
    
    private InputsCheckRowResponse createEmptyRow(
            String teacher,
            String className,
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
        
        return new InputsCheckRowResponse(teacher,className, gubun, weeks);
    }
    
    
}
