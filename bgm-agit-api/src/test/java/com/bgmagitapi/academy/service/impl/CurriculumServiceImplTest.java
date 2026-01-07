package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.dto.request.CurriculumPutRequest;
import com.bgmagitapi.academy.dto.response.CurriculumGetResponse;
import com.bgmagitapi.academy.service.CurriculumService;
import com.bgmagitapi.apiresponse.ApiResponse;
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
    
    @DisplayName("")
    @Test
    void test2(){
        CurriculumGetResponse curriculum = curriculumService.getCurriculum(2026,"3G");
        System.out.println("curriculum = " + curriculum);
    }
    
    @DisplayName("")
    @Test
    void test3(){
        // given
         CurriculumPutRequest request = buildModifyRequest();
 
         // when
         ApiResponse response = curriculumService.modifyCurriculum(request);
 
         // then
         System.out.println(response);
    }
    
    private CurriculumPutRequest buildModifyRequest() {
    
        return CurriculumPutRequest.builder()
                .id(1L)   // 수정할 curriculumId
                .year(2026)
                .className("3G")
                .title("커리큘럼 12월 예시 수정본")
                .rows(List.of(
    
                        //1) 기존 row 수정 (id 존재)
                        CurriculumPutRequest.Row.builder()
                                .id(1L)  // ← DB에 이미 존재하는 progress id
                                .progressType("국어(수정됨)")
                                .months(List.of(
    
                                        // 기존 cont 수정
                                        CurriculumPutRequest.MonthContent.builder()
                                                .id(1L) // DB 존재
                                                .startMonth(1)
                                                .endMonth(2)
                                                .content("받아쓰기 (수정)")
                                                .build(),
    
                                        // 기존 cont 또 수정
                                        CurriculumPutRequest.MonthContent.builder()
                                                .id(2L)
                                                .startMonth(3)
                                                .endMonth(3)
                                                .content("문장쓰기 (수정)")
                                                .build(),
    
                                        // 새로운 range 추가 (id 없음)
                                        CurriculumPutRequest.MonthContent.builder()
                                                .startMonth(10)
                                                .endMonth(12)
                                                .content("글짓기 (신규)")
                                                .build()
                                ))
                                .build(),
    
                        // 2) 새 row 추가 (id 없음)
                        CurriculumPutRequest.Row.builder()
                                .progressType("사회(신규)")
                                .months(List.of(
                                        CurriculumPutRequest.MonthContent.builder()
                                                .startMonth(1)
                                                .endMonth(6)
                                                .content("지리 배우기")
                                                .build()
                                ))
                                .build()
    
                ))
                .build();
    }
}