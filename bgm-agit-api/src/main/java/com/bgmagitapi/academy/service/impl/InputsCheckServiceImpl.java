package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.response.*;
import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.entity.ProgressInputs;
import com.bgmagitapi.academy.repository.CurriculumContRepository;
import com.bgmagitapi.academy.repository.CurriculumProgressRepository;
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
    private final CurriculumProgressRepository curriculumProgressRepository;

    @Override
    public InputsCheckGetResponse getInputsChecks(LocalDate years) {

        int year = years.getYear();
        List<InputsCheckDateHeader> headers = createYearHeaders(year);

        for (int i = 0; i < headers.size(); i++) {

            InputsCheckDateHeader header = headers.get(i);

            List<InputsCheckClassResponse> rows =
                    buildCheckClasses(header);

            headers.set(
                    i,
                    new InputsCheckDateHeader(
                            year,
                            header.getMonth(),
                            header.getWeekGroups(),
                            rows
                    )
            );
        }

        return new InputsCheckGetResponse(headers);
    }

    /* ===================== HEADER ===================== */

    private List<InputsCheckDateHeader> createYearHeaders(int year) {
        List<InputsCheckDateHeader> headers = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            headers.add(createMonthHeader(year, month));
        }
        return headers;
    }

    private InputsCheckDateHeader createMonthHeader(int year, int month) {

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<InputsCheckDateHeader.WeekGroup> groups = new ArrayList<>();
        LocalDate cursor = start;

        while (!cursor.isAfter(end)) {

            DayOfWeek dow = cursor.getDayOfWeek();

            if (dow == DayOfWeek.SUNDAY) {
                cursor = cursor.plusDays(1);
                continue;
            }

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

        return new InputsCheckDateHeader(year,month, groups, new ArrayList<>());
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

    /* ===================== MAIN LOGIC ===================== */

    private List<InputsCheckClassResponse> buildCheckClasses(
            InputsCheckDateHeader header
    ) {
    
        List<ProgressInputs> inputRows =
                inputsRepository.findByInputsCheck();
    
        Map<Long, List<CurriculumCont>> contMap =
                curriculumContRepository.findAll()
                        .stream()
                        .collect(Collectors.groupingBy(
                                cc -> cc.getCurriculumProgress().getId()
                        ));
    
        // class → teacher → progress
        Map<String, Map<String, Map<String, InputsCheckRowResponse>>> classMap =
                new LinkedHashMap<>();
    
        // 반 목록
        Set<String> classNames =
                inputRows.stream()
                        .map(r -> r.getCurriculumProgress().getCurriculum().getClasses())
                        .collect(Collectors.toSet());
    
        for (String className : classNames) {
    
            // 이 반의 모든 진도구분
            List<CurriculumProgress> progressList =
                    curriculumProgressRepository.findByCurriculum_Classes(className);
    
            // teacher 목록
            Set<String> teachers =
                    inputRows.stream()
                            .filter(r ->
                                    r.getCurriculumProgress()
                                     .getCurriculum()
                                     .getClasses()
                                     .equals(className)
                            )
                            .map(r -> r.getInputs().getTeacher())
                            .collect(Collectors.toSet());
    
            for (String teacher : teachers) {
    
                Map<String, Map<String, InputsCheckRowResponse>> teacherMap =
                        classMap.computeIfAbsent(className, k -> new LinkedHashMap<>());
    
                Map<String, InputsCheckRowResponse> progressMap =
                        teacherMap.computeIfAbsent(teacher, k -> new LinkedHashMap<>());
    
                for (CurriculumProgress cp : progressList) {
    
                    String progressGubun = cp.getProgressGubun();
    
                    InputsCheckRowResponse parent =
                            progressMap.computeIfAbsent(
                                    progressGubun,
                                    g -> new InputsCheckRowResponse(
                                            progressGubun,
                                            new ArrayList<>()
                                    )
                            );
    
                    List<ProgressInputs> inputsByProgress =
                            inputRows.stream()
                                    .filter(r ->
                                            r.getCurriculumProgress().getId().equals(cp.getId())
                                         && r.getInputs().getTeacher().equals(teacher)
                                    )
                                    .toList();
    
                    for (ProgressInputs row : inputsByProgress) {
    
                        LocalDate date = row.getInputs().getInputsDate();
    
                        InputsCheckDateHeader.WeekGroup weekGroup =
                                header.getWeekGroups().stream()
                                        .filter(g ->
                                                date.equals(g.getStartDate())
                                             || date.equals(g.getEndDate())
                                        )
                                        .findFirst()
                                        .orElse(null);
    
                        if (weekGroup == null) continue;
    
                        // WeekCheck 찾거나 생성
                        InputsCheckRowResponse.WeekCheck week =
                                parent.getWeeks().stream()
                                        .filter(w ->
                                                w.getStartDate().equals(weekGroup.getStartDate()) &&
                                                w.getEndDate().equals(weekGroup.getEndDate())
                                        )
                                        .findFirst()
                                        .orElseGet(() -> {
    
                                            String curriculumContent =
                                                    contMap.getOrDefault(cp.getId(), List.of())
                                                            .stream()
                                                            .filter(cc -> {
                                                                int m = date.getMonthValue();
                                                                return m >= cc.getStartMonths()
                                                                    && m <= cc.getEndMonths();
                                                            })
                                                            .map(CurriculumCont::getCont)
                                                            .collect(Collectors.joining(", "));
    
                                            InputsCheckRowResponse.CheckItem startItem =
                                                    new InputsCheckRowResponse.CheckItem(
                                                            weekGroup.getStartDate(),
                                                            curriculumContent,
                                                            new ArrayList<>()
                                                    );
    
                                            InputsCheckRowResponse.CheckItem endItem =
                                                    new InputsCheckRowResponse.CheckItem(
                                                            weekGroup.getEndDate(),
                                                            curriculumContent,
                                                            new ArrayList<>()
                                                    );
    
                                            InputsCheckRowResponse.WeekCheck newWeek =
                                                    new InputsCheckRowResponse.WeekCheck(
                                                            weekGroup.getStartDate(),
                                                            weekGroup.getEndDate(),
                                                            startItem,
                                                            endItem
                                                    );
    
                                            parent.getWeeks().add(newWeek);
                                            return newWeek;
                                        });
    
                        // content 누적
                        String contentText =
                                row.getTextBook()
                                        + " "
                                        + row.getUnit()
                                        + " "
                                        + row.getPages();
    
                        if (date.equals(week.getStartDate())) {
                            week.getStartItem().getContents().add(contentText);
                        }
    
                        if (date.equals(week.getEndDate())) {
                            week.getEndItem().getContents().add(contentText);
                        }
                    }
                }
            }
        }
    
        // ===== response 변환 =====
        List<InputsCheckClassResponse> result = new ArrayList<>();
    
        for (Map.Entry<String, Map<String, Map<String, InputsCheckRowResponse>>> classEntry
                : classMap.entrySet()) {
    
            List<InputsCheckTeacherResponse> teacherResponses = new ArrayList<>();
    
            for (Map.Entry<String, Map<String, InputsCheckRowResponse>> teacherEntry
                    : classEntry.getValue().entrySet()) {
    
                teacherResponses.add(
                        new InputsCheckTeacherResponse(
                                teacherEntry.getKey(),
                                new ArrayList<>(teacherEntry.getValue().values())
                        )
                );
            }
    
            result.add(
                    new InputsCheckClassResponse(
                            classEntry.getKey(),
                            teacherResponses
                    )
            );
        }
    
        return result;
    }
}
