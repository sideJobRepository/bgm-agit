package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.dto.request.CurriculumPutRequest;
import com.bgmagitapi.academy.dto.response.CurriculumGetResponse;
import com.bgmagitapi.academy.entity.*;
import com.bgmagitapi.academy.repository.CurriculumContRepository;
import com.bgmagitapi.academy.repository.CurriculumProgressRepository;
import com.bgmagitapi.academy.repository.CurriculumRepository;
import com.bgmagitapi.academy.repository.InputsRepository;
import com.bgmagitapi.academy.service.CurriculumService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CurriculumServiceImpl implements CurriculumService {
    
    private final CurriculumRepository curriculumRepository;
    private final CurriculumContRepository curriculumContRepository;
    private final CurriculumProgressRepository curriculumProgressRepository;
    private final InputsRepository inputsRepository;
    
    @Override
    public CurriculumGetResponse getCurriculum(Integer year, String className) {
        List<CurriculumCont> findCurriculum = curriculumRepository.findByCurriculum(year, className);
        
        if (findCurriculum != null && !findCurriculum.isEmpty()) {
            Curriculum curriculum = findCurriculum.get(0).getCurriculumProgress().getCurriculum();
            
            return new CurriculumGetResponse(
                    curriculum.getId(),
                    curriculum.getYears(),
                    curriculum.getClasses(),
                    curriculum.getTitle(),
                    findCurriculum.stream()
                            .collect(Collectors.groupingBy(c ->
                                    c.getCurriculumProgress().getId()
                            ))
                            .entrySet()
                            .stream()
                            .sorted(Map.Entry.comparingByKey())
                            .map(entry -> {
                                Long progressId = entry.getKey();
                                List<CurriculumCont> contList = entry.getValue();
            
                                String progressType =
                                        contList.get(0)
                                                .getCurriculumProgress()
                                                .getProgressGubun();
                                
                                List<CurriculumGetResponse.MonthContent> ranges =
                                        contList.stream()
                                                .sorted(Comparator.comparing(CurriculumCont::getId))
                                                .map(cc -> new CurriculumGetResponse.MonthContent(
                                                        cc.getId(),
                                                        cc.getStartMonths(),
                                                        cc.getEndMonths(),
                                                        cc.getCont()
                                                ))
                                                .toList();
            
                                return new CurriculumGetResponse.Row(
                                        progressId,
                                        progressType,
                                        ranges
                                );
                            })
                            .toList()
            );
        }else {
            return new CurriculumGetResponse();
        }
    }
    
    @Override
    public ApiResponse createCurriculum(CurriculumPostRequest request) {
        Curriculum curriculum = Curriculum.builder()
                .title(request.getTitle())
                .years(request.getYear())
                .classes(request.getClassName())
                .build();
        
        curriculumRepository.save(curriculum);
        

        List<CurriculumPostRequest.Row> rows =
                Optional.ofNullable(request.getRows())
                        .orElse(Collections.emptyList());
        
        for (CurriculumPostRequest.Row row : rows) {
            
            CurriculumProgress curriculumProgress = CurriculumProgress.builder()
                    .curriculum(curriculum)
                    .progressGubun(row.getProgressType())
                    .build();
        
            curriculumProgressRepository.save(curriculumProgress);
        
       
            List<CurriculumPostRequest.MonthContent> months =
                    Optional.ofNullable(row.getMonths())
                            .orElse(Collections.emptyList());
        
            if (months.isEmpty()) {
                continue;
            }
        
            for (CurriculumPostRequest.MonthContent item : months) {
        
                CurriculumCont cont = CurriculumCont.builder()
                        .curriculumProgress(curriculumProgress)
                        .startMonths(item.getStartMonth())
                        .endMonths(item.getEndMonth())
                        .cont(item.getContent())
                        .build();
        
                curriculumContRepository.save(cont);
            }
        }
        
        return new ApiResponse(200, true, "저장 성공");
    }
    
    @Override
    public ApiResponse modifyCurriculum(CurriculumPutRequest request) {

        Long curriculumId = request.getId();
     
         // =============================
         // 1. 기존 Curriculum 조회
         // =============================
         Curriculum curriculum = curriculumRepository.findById(curriculumId)
                 .orElseThrow(() -> new RuntimeException("존재 하지않는 커리큘럼 입니다."));
     
         // =============================
         // 2. 기존 Progress 조회
         // =============================
         List<CurriculumProgress> progresses =
                 curriculumProgressRepository.findByCurriculumId(curriculumId);
     
         List<Long> progressIds = progresses.stream()
                 .map(CurriculumProgress::getId)
                 .toList();
     
         // =============================
         // 3. ProgressInputs FK 끊기 (가장 중요)
         // =============================
         if (!progressIds.isEmpty()) {
             inputsRepository.clearCurriculumProgress(progressIds);
         }
     
         // =============================
         // 4. CurriculumCont 삭제
         // =============================
         curriculumContRepository.deleteByCurriculumId(curriculumId);
     
         // =============================
         // 5. CurriculumProgress 삭제
         // =============================
         curriculumProgressRepository.deleteByCurriculumId(curriculumId);
     
         // =============================
         // 6. Curriculum 삭제
         // =============================
         curriculumRepository.delete(curriculum);
     
         // =============================
         // 7. 새 Curriculum 생성
         // =============================
         Curriculum saveCurriculum = curriculumRepository.save(
                 Curriculum.builder()
                         .title(request.getTitle())
                         .years(request.getYear())
                         .classes(request.getClassName())
                         .build()
         );
     
         // =============================
         // 8. Progress / Cont 재생성
         // =============================
         List<CurriculumPutRequest.Row> rows =
                 Optional.ofNullable(request.getRows())
                         .orElse(Collections.emptyList());
     
         for (CurriculumPutRequest.Row row : rows) {
     
             CurriculumProgress curriculumProgress =
                     curriculumProgressRepository.save(
                             CurriculumProgress.builder()
                                     .curriculum(saveCurriculum)
                                     .progressGubun(row.getProgressType())
                                     .build()
                     );
     
             List<CurriculumPutRequest.MonthContent> months =
                     Optional.ofNullable(row.getMonths())
                             .orElse(Collections.emptyList());
     
             for (CurriculumPutRequest.MonthContent item : months) {
     
                 curriculumContRepository.save(
                         CurriculumCont.builder()
                                 .curriculumProgress(curriculumProgress)
                                 .startMonths(item.getStartMonth())
                                 .endMonths(item.getEndMonth())
                                 .cont(item.getContent())
                                 .build()
                 );
             }
         }
     
         return new ApiResponse(200, true, "수정 되었습니다.");
    }
}

