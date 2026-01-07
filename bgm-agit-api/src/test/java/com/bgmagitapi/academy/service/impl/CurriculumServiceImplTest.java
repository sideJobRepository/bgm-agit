package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.service.CurriculumService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CurriculumServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private CurriculumService curriculumService;
    
    @DisplayName("")
    @Test
    void test1() {
        
        CurriculumPostRequest.MonthContent monthContent1 = CurriculumPostRequest.MonthContent
                .builder()
                .startMonth(1)
                .endMonth(2)
                .content("내용1")
                .build();
        
        
        CurriculumPostRequest.MonthContent monthContent2 = CurriculumPostRequest.MonthContent
                .builder()
                .startMonth(3)
                .endMonth(12)
                .content("내용2")
                .build();
        
        CurriculumPostRequest.MonthContent monthContent3 = CurriculumPostRequest.MonthContent
                .builder()
                .startMonth(1)
                .endMonth(6)
                .content("내용3")
                .build();
        
        
        CurriculumPostRequest.MonthContent monthContent4 = CurriculumPostRequest.MonthContent
                .builder()
                .startMonth(7)
                .endMonth(11)
                .content("내용4")
                .build();
        
        
        List<CurriculumPostRequest.MonthContent> monthContentList1 = List.of(monthContent1, monthContent2);
        List<CurriculumPostRequest.MonthContent> monthContentList2 = List.of(monthContent3, monthContent4);
        
        CurriculumPostRequest.Row row1 = CurriculumPostRequest.Row
                .builder()
                .progressType("수학")
                .months(monthContentList1)
                .build();
        
        
        CurriculumPostRequest.Row row2 = CurriculumPostRequest.Row
                .builder()
                .progressType("영어")
                .months(monthContentList2)
                .build();
        
        List<CurriculumPostRequest.Row> rowList = List.of(row1, row2);
        CurriculumPostRequest request = CurriculumPostRequest.builder()
                .year(2026)
                .title("타이틀")
                .className("3G")
                .rows(rowList)
                .build();
        
        
        curriculumService.createCurriculum(request);
    }
    
}