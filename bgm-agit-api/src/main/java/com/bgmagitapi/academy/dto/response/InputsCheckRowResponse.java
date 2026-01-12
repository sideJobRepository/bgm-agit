package com.bgmagitapi.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class InputsCheckRowResponse {

    // 진도 구분 (기본 / 실력 / 점프 / 유형 / step45 등)
    private String progressGubun;

    // 날짜별 체크 데이터
    private List<CheckItem> items;

    @Getter
    @AllArgsConstructor
    public static class CheckItem {

        private LocalDate date;   // 해당 날짜
        private String content;   // 단원/페이지/텍스트
    }
}