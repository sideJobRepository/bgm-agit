package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.dto.request.CurriculumPutRequest;
import com.bgmagitapi.academy.dto.response.CurriculumGetResponse;
import com.bgmagitapi.academy.entity.Curriculum;
import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.entity.Inputs;
import com.bgmagitapi.academy.repository.CurriculumContRepository;
import com.bgmagitapi.academy.repository.CurriculumProgressRepository;
import com.bgmagitapi.academy.repository.CurriculumRepository;
import com.bgmagitapi.academy.repository.InputsRepository;
import com.bgmagitapi.academy.service.CurriculumService;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.querydsl.codegen.ParameterizedTypeImpl;
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
        
        Curriculum curriculum = curriculumRepository.findById(curriculumId).orElseThrow(() -> new RuntimeException("존재 하지않는 커리큘럼 입니다."));
        
        List<CurriculumProgress> progresses = curriculumProgressRepository.findByCurriculumId(curriculumId);
        
        List<CurriculumCont> cont = curriculumContRepository.findByCurriculumId(curriculumId);
        
        curriculumContRepository.deleteAll(cont);
        
        List<Inputs> inputs =
                inputsRepository.findByCurriculumProgressIds(
                        progresses.stream()
                                  .map(CurriculumProgress::getId)
                                  .toList()
                );
        
        for (Inputs input : inputs) {
         //   input.modifyInptsCurriculumProgressId();;
        }
        curriculumProgressRepository.deleteAll(progresses);
        curriculumRepository.delete(curriculum);
        
        Curriculum saveCurriculum = Curriculum.builder()
                     .title(request.getTitle())
                     .years(request.getYear())
                     .classes(request.getClassName())
                     .build();
             
             curriculumRepository.save(saveCurriculum);
             
     
             List<CurriculumPutRequest.Row> rows = Optional.ofNullable(request.getRows()).orElse(Collections.emptyList());
             
             for (CurriculumPutRequest.Row row : rows) {
                 
                 CurriculumProgress curriculumProgress = CurriculumProgress.builder()
                         .curriculum(saveCurriculum)
                         .progressGubun(row.getProgressType())
                         .build();
             
                 curriculumProgressRepository.save(curriculumProgress);
             
            
                 List<CurriculumPutRequest.MonthContent> months =
                         Optional.ofNullable(row.getMonths())
                                 .orElse(Collections.emptyList());
             
                 if (months.isEmpty()) {
                     continue;
                 }
             
                 for (CurriculumPutRequest.MonthContent item : months) {
             
                     CurriculumCont cont1 = CurriculumCont.builder()
                             .curriculumProgress(curriculumProgress)
                             .startMonths(item.getStartMonth())
                             .endMonths(item.getEndMonth())
                             .cont(item.getContent())
                             .build();
             
                     curriculumContRepository.save(cont1);
                 }
             }
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
}

