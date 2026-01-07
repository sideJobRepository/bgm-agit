package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.dto.request.CurriculumPutRequest;
import com.bgmagitapi.academy.dto.response.CurriculumGetResponse;
import com.bgmagitapi.academy.entity.Curriculum;
import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.repository.CurriculumContRepository;
import com.bgmagitapi.academy.repository.CurriculumProgressRepository;
import com.bgmagitapi.academy.repository.CurriculumRepository;
import com.bgmagitapi.academy.service.CurriculumService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CurriculumServiceImpl implements CurriculumService {
    
    private final CurriculumRepository curriculumRepository;
    private final CurriculumContRepository curriculumContRepository;
    private final CurriculumProgressRepository curriculumProgressRepository;
    
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
                            .map(entry -> {
                                Long progressId = entry.getKey();
                                List<CurriculumCont> contList = entry.getValue();
                                String progressType = contList.get(0).getCurriculumProgress().getProgressGubun();
                                List<CurriculumGetResponse.MonthContent> ranges =
                                        contList.stream()
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
                            .toList());
        }else {
            return new CurriculumGetResponse();
        }
    }
    
    @Override
    public ApiResponse createCurriculum(CurriculumPostRequest request) {
        Curriculum curriculum = Curriculum
                .builder()
                .title(request.getTitle())
                .years(request.getYear())
                .classes(request.getClassName())
                .build();
        
        curriculumRepository.save(curriculum);
        
        List<CurriculumPostRequest.Row> rows = request.getRows();
        for (CurriculumPostRequest.Row row : rows) {
            String progressType = row.getProgressType();
            CurriculumProgress curriculumProgress = CurriculumProgress
                    .builder()
                    .curriculum(curriculum)
                    .progressGubun(progressType)
                    .build();
            curriculumProgressRepository.save(curriculumProgress);
            List<CurriculumPostRequest.MonthContent> months = row.getMonths();
            months.forEach(item -> {
                String content = item.getContent();
                Integer startMonth = item.getStartMonth();
                Integer endMonth = item.getEndMonth();
                
                CurriculumCont cont = CurriculumCont
                        .builder()
                        .curriculumProgress(curriculumProgress)
                        .startMonths(startMonth)
                        .endMonths(endMonth)
                        .cont(content)
                        .build();
                curriculumContRepository.save(cont);
            });
            
        }
        return new ApiResponse(200, true, "저장성공");
    }
    
    @Override
    public ApiResponse modifyCurriculum(CurriculumPutRequest request) {
        
        Long curriculumId = request.getId();
        
        Curriculum curriculum = curriculumRepository.findById(curriculumId).orElseThrow(() -> new RuntimeException("존재 하지않는 커리큘럼 입니다."));
        
        
        // ========== 1) 기존 DB 데이터 조회 ==========
        List<CurriculumProgress> dbProgress = curriculumProgressRepository.findByCurriculumId(curriculumId);
        
        List<CurriculumCont> dbCont = curriculumContRepository.findByCurriculumId(curriculumId);
        
        Set<Long> requestProgressIds = new HashSet<>();
        Set<Long> requestContIds = new HashSet<>();
        
        // ========== 2) 요청 rows 처리 ==========
        for (CurriculumPutRequest.Row rowReq : request.getRows()) {
            
            CurriculumProgress progress;
            
            // --- UPDATE ---
            if (rowReq.getId() != null) {
                requestProgressIds.add(rowReq.getId());
                progress = curriculumProgressRepository.findById(rowReq.getId())
                        .orElseThrow(() -> new RuntimeException("없는 row id"));
                progress.modifyProgressGubun(rowReq.getProgressType());
            }
            // --- INSERT ---
            else {
                progress = CurriculumProgress.builder()
                        .curriculum(curriculum)
                        .progressGubun(rowReq.getProgressType())
                        .build();
                
                curriculumProgressRepository.save(progress);
                requestProgressIds.add(progress.getId());
            }
            
            // ===== ranges 처리 =====
            for (CurriculumPutRequest.MonthContent mc : rowReq.getMonths()) {
                
                CurriculumCont cont;
                
                // --- UPDATE ---
                if (mc.getId() != null) {
                    requestContIds.add(mc.getId());
                    cont = curriculumContRepository.findById(mc.getId())
                            .orElseThrow(() -> new RuntimeException("없는 cont id"));
                    
                    cont.modifyCont(mc.getStartMonth(), mc.getEndMonth(), mc.getContent());
                    
                }
                // --- INSERT ---
                else {
                    cont = CurriculumCont.builder()
                            .curriculumProgress(progress)
                            .startMonths(mc.getStartMonth())
                            .endMonths(mc.getEndMonth())
                            .cont(mc.getContent())
                            .build();
                    
                    curriculumContRepository.save(cont);
                    requestContIds.add(cont.getId());
                }
            }
        }
        
        // 요청에 없는 것 삭제
        // row 삭제
        dbProgress.stream()
                .filter(p -> !requestProgressIds.contains(p.getId()))
                .forEach(curriculumProgressRepository::delete);
        
        // cont 삭제
        dbCont.stream()
                .filter(c -> !requestContIds.contains(c.getId()))
                .forEach(curriculumContRepository::delete);
        
        
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
}

