package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.response.InputsCheckDateHeader;
import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCheckRowResponse;
import com.bgmagitapi.academy.entity.CurriculumCont;
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
  
        InputsCheckDateHeader header = createJanuaryHeader(2026);
        List<InputsCheckRowResponse> rows = buildCheckRows(className,header);
    
        return new InputsCheckGetResponse(header, rows);
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
    
    private List<InputsCheckRowResponse> buildCheckRows(String className,  InputsCheckDateHeader header) {
    
        // 1. DB 조회 (ProgressInputs 기준)
      List<ProgressInputs> rows =
              inputsRepository.findByInputsCheck(className);
  
      // 2. 진도구분 기준으로 묶기
      Map<String, InputsCheckRowResponse> resultMap = new LinkedHashMap<>();
  
      for (ProgressInputs row : rows) {
  
          String gubun =
                  row.getCurriculumProgress()
                          .getProgressGubun();
  
          InputsCheckRowResponse parent =
                  resultMap.computeIfAbsent(
                          gubun,
                          key -> new InputsCheckRowResponse(
                                  key,
                                  new ArrayList<>()
                          )
                  );
  
          // 3. CheckItem 생성
          InputsCheckRowResponse.CheckItem item =
                  new InputsCheckRowResponse.CheckItem(
                          row.getInputs().getInputsDate(),
                          row.getUnit() + " " + row.getPages()
                  );
  
          // 4. 날짜 기준 정확한 위치에 배치
          addItemByWeekGroup(parent, header, item);
      }
  
      return new ArrayList<>(resultMap.values());
    }
    
    private void addItemByWeekGroup(
            InputsCheckRowResponse row,
            InputsCheckDateHeader header,
            InputsCheckRowResponse.CheckItem item
    ) {
        LocalDate date = item.getDate();
    
        for (InputsCheckDateHeader.WeekGroup group : header.getWeekGroups()) {
    
            // startDate → 무조건 첫 칸 (월/수/금)
            if (date.equals(group.getStartDate())) {
                ensureSize(row.getItems(), 1);
                row.getItems().set(0, item);
                return;
            }
    
            // endDate → 두 번째 칸 (화/목/토)
            if (date.equals(group.getEndDate())) {
                ensureSize(row.getItems(), 2);
                row.getItems().set(1, item);
                return;
            }
        }
    
        // 어느 주에도 안 맞으면 뒤에 추가 (예외 케이스)
        row.getItems().add(item);
    }
    
    private void ensureSize(List<InputsCheckRowResponse.CheckItem> list, int size) {
        while (list.size() < size) {
            list.add(null);
        }
    }
    
    
    
}
