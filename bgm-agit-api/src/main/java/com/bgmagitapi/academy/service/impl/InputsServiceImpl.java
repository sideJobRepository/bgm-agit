package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.request.InputsPostRequest;
import com.bgmagitapi.academy.dto.request.InputsPutRequest;
import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.entity.Inputs;
import com.bgmagitapi.academy.entity.ProgressInputs;
import com.bgmagitapi.academy.repository.CurriculumProgressRepository;
import com.bgmagitapi.academy.repository.InputsRepository;
import com.bgmagitapi.academy.repository.ProgressInputsRepository;
import com.bgmagitapi.academy.service.InputsService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Transactional
@RequiredArgsConstructor
@Service
public class InputsServiceImpl implements InputsService {
    
    private final InputsRepository inputsRepository;
    
    private final CurriculumProgressRepository progressRepository;
    
    private final ProgressInputsRepository progressInputsRepository;
    
    @Override
    public List<InputsCurriculumGetResponse> getCurriculum(String className, Integer year) {
        return inputsRepository.findByCurriculum(className,year);
    }
    
    @Override
    public List<InputGetResponse> getInputs(String className,LocalDate date) {
      
        List<ProgressInputs> rows =
                inputsRepository.findByInputs(className, date);
        
        // inputs.id 기준으로 묶기
        Map<Long, InputGetResponse> resultMap = new LinkedHashMap<>();
        
        for (ProgressInputs row : rows) {
        
            Long inputsId = row.getInputs().getId();
        
            InputGetResponse parent =
                    resultMap.computeIfAbsent(
                            inputsId,
                            id -> {
                                InputGetResponse res =
                                        new InputGetResponse(
                                                row.getInputs().getId(),
                                                row.getCurriculumProgress().getId(),
                                                row.getInputs().getClasses(),
                                                row.getInputs().getTeacher(),
                                                row.getInputs().getSubjects(),
                                                row.getInputs().getProgress(),
                                                row.getInputs().getTests(),
                                                row.getInputs().getHomework(),
                                                row.getInputs().getInputsDate()
                                        );
                                res.setProgressItems(new ArrayList<>());
                                return res;
                            }
                    );
        
            //ProgressInputs = 단원 1개
            parent.getProgressItems().add(
                    new InputGetResponse.ProgressItem(
                            row.getId(),
                            row.getTextBook(),
                            row.getUnit(),
                            row.getPages()
                    )
            );
        }
        
        return new ArrayList<>(resultMap.values());
    }
    
    @Override
    public ApiResponse createInputs(InputsPostRequest request) {
        
        Inputs inputs = Inputs
                          .builder()
                          .classes(request.getInputsClasses())
                          .teacher(request.getInputsTeacher())
                          .subjects(request.getInputsSubjects())
                          .progress(request.getInputsProgress())
                          .tests(request.getInputsTests())
                          .homework(request.getInputsHomework())
                          .inputsDate(LocalDate.now())
                          .build();
        inputsRepository.save(inputs);
        List<InputsPostRequest.ProgressInputsRequest> progressInputsRequests = request.getProgressInputsRequests();
        for (InputsPostRequest.ProgressInputsRequest progressInputsRequest : progressInputsRequests) {
            Long curriculumProgressId = progressInputsRequest.getCurriculumProgressId();
            CurriculumProgress curriculumProgress = progressRepository.findById(curriculumProgressId)
                    .orElseThrow(() -> new RuntimeException("존재하지않는 커리큘럼 입니다."));
            
            ProgressInputs progressInputs = ProgressInputs
                    .builder()
                    .curriculumProgress(curriculumProgress)
                    .inputs(inputs)
                    .textBook(progressInputsRequest.getTextbook())
                    .unit(progressInputsRequest.getInputsUnit())
                    .pages(progressInputsRequest.getInputsPages())
                    .build();
            progressInputsRepository.save(progressInputs);
            
        }
        return new ApiResponse(200, true, "저장 되었습니다.");
    }
    
    @Override
    public ApiResponse modifyInputs(InputsPutRequest request) {
        Long id = request.getId();
        Long curriculumProgressId = request.getCurriculumProgressId();
        Inputs findInputs = inputsRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지않는 id"));
        CurriculumProgress findCurriculumProgress = progressRepository.findById(curriculumProgressId).orElseThrow(() -> new RuntimeException("존재하지않는 id"));
        //findInputs.modifyInputs(request, findCurriculumProgress);
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
}
