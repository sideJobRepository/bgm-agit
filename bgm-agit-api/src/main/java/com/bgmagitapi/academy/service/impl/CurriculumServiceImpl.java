package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
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

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CurriculumServiceImpl implements CurriculumService {

    private final CurriculumRepository curriculumRepository;
    private final CurriculumContRepository curriculumContRepository;
    private final CurriculumProgressRepository curriculumProgressRepository;
    
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
        return new  ApiResponse(200,true,"저장성공");
    }
}

