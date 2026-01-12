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
import com.querydsl.core.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
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
        List<Tuple> rows =
                curriculumRepository.findByCurriculum(year, className);
        
        if (rows.isEmpty()) {
            return new CurriculumGetResponse();
        }
        
        Curriculum curriculum = rows.get(0).get(QCurriculum.curriculum);
        
        Map<Long, CurriculumGetResponse.Row> rowMap = new LinkedHashMap<>();
        
        for (Tuple t : rows) {
        
            CurriculumProgress progress =
                    t.get(QCurriculumProgress.curriculumProgress);
            CurriculumCont cont =
                    t.get(QCurriculumCont.curriculumCont);
        
            CurriculumGetResponse.Row row =
                    rowMap.computeIfAbsent(
                            progress.getId(),
                            id -> new CurriculumGetResponse.Row(
                                    progress.getId(),
                                    progress.getProgressGubun(),
                                    new ArrayList<>()
                            )
                    );
        
            // cont가 있는 경우만 추가
            if (cont != null) {
                row.getMonths().add(
                        new CurriculumGetResponse.MonthContent(
                                cont.getId(),
                                cont.getStartMonths(),
                                cont.getEndMonths(),
                                cont.getCont()
                        )
                );
            }
        }
        
        return new CurriculumGetResponse(
                curriculum.getId(),
                curriculum.getYears(),
                curriculum.getClasses(),
                curriculum.getTitle(),
                new ArrayList<>(rowMap.values())
        );
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
        // 1. Curriculum 수정
        // =============================
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new RuntimeException("존재 하지않는 커리큘럼 입니다."));
    
        curriculum.modify(
                request.getTitle(),
                request.getYear(),
                request.getClassName()
        );
    
        // =============================
        // 2. 기존 Progress 전부 조회 (Map)
        // =============================
        List<CurriculumProgress> progresses =
                curriculumProgressRepository.findByCurriculumId(curriculumId);
    
        Map<Long, CurriculumProgress> progressMap =
                progresses.stream()
                        .collect(Collectors.toMap(
                                CurriculumProgress::getId,
                                Function.identity()
                        ));
    
        // =============================
        // 3. 요청 rows 처리 (수정 / 신규)
        // =============================
        List<CurriculumPutRequest.Row> rows =
                Optional.ofNullable(request.getRows())
                        .orElse(Collections.emptyList());
    
        // 요청으로 들어온 progress id 수집
        Set<Long> requestIds = rows.stream()
                .map(CurriculumPutRequest.Row::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    
        for (CurriculumPutRequest.Row row : rows) {
    
            CurriculumProgress progress;
    
            // ---------- 수정 ----------
            if (row.getId() != null) {
    
                progress = progressMap.get(row.getId());
                if (progress == null) {
                    throw new RuntimeException("존재하지 않는 progress id = " + row.getId());
                }
    
                progress.modifyProgressGubun(row.getProgressType());
    
            }
            // ---------- 신규 ----------
            else {
                progress = curriculumProgressRepository.save(
                        CurriculumProgress.builder()
                                .curriculum(curriculum)
                                .progressGubun(row.getProgressType())
                                .build()
                );
            }
    
            // ---------- ranges: 항상 delete → insert ----------
            curriculumContRepository.deleteByCurriculumProgressId(progress.getId());
    
            List<CurriculumPutRequest.MonthContent> months =
                    Optional.ofNullable(row.getMonths())
                            .orElse(Collections.emptyList());
    
            for (CurriculumPutRequest.MonthContent item : months) {
    
                curriculumContRepository.save(
                        CurriculumCont.builder()
                                .curriculumProgress(progress)
                                .startMonths(item.getStartMonth())
                                .endMonths(item.getEndMonth())
                                .cont(item.getContent())
                                .build()
                );
            }
        }
    
        // =============================
        // 4. 요청에 없는 Progress 삭제
        // =============================
        for (CurriculumProgress progress : progressMap.values()) {
    
            // 요청에 없는 기존 Progress
            if (!requestIds.contains(progress.getId())) {
    
                // 4-1. ProgressInputs FK 끊기 (중요)
                inputsRepository.clearCurriculumProgress(
                        List.of(progress.getId())
                );
    
                // 4-2. ranges 삭제
                curriculumContRepository.deleteByCurriculumProgressId(progress.getId());
    
                // 4-3. Progress 삭제
                curriculumProgressRepository.delete(progress);
            }
        }
    
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
}

