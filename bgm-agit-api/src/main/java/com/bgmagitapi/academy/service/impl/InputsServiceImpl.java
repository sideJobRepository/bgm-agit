package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.request.InputsPostRequest;
import com.bgmagitapi.academy.dto.request.InputsPutRequest;
import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.entity.CurriculumProgress;
import com.bgmagitapi.academy.entity.Inputs;
import com.bgmagitapi.academy.repository.CurriculumProgressRepository;
import com.bgmagitapi.academy.repository.InputsRepository;
import com.bgmagitapi.academy.service.InputsService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Transactional
@RequiredArgsConstructor
@Service
public class InputsServiceImpl implements InputsService {
    
    private final InputsRepository inputsRepository;
    
    private final CurriculumProgressRepository progressRepository;
    
    @Override
    public List<InputsCurriculumGetResponse> getCurriculum(String className) {
        return inputsRepository.findByCurriculum(className);
    }
    
    @Override
    public List<InputGetResponse> getInputs(String className) {
        return inputsRepository.findByInputs(className);
    }
    
    @Override
    public ApiResponse createInputs(InputsPostRequest request) {
        Long curriculumProgressId = request.getCurriculumProgressId();
        CurriculumProgress curriculumProgress = progressRepository.findById(curriculumProgressId)
                .orElseThrow(() -> new RuntimeException("존재하지않는 커리큘럼 입니다."));
        Inputs inputs = Inputs
                .builder()
                .curriculumProgress(curriculumProgress)
                .classes(request.getInputsClasses())
                .teacher(request.getInputsTeacher())
                .subjects(request.getInputsSubjects())
                .unit(request.getInputsUnit())
                .pages(request.getInputsPages())
                .progress(request.getInputsProgress())
                .tests(request.getInputsTests())
                .homework(request.getInputsHomework())
                .inputsDate(request.getInputsDate())
                .build();
        inputsRepository.save(inputs);
        return new ApiResponse(200, true, "저장 되었습니다.");
    }
    
    @Override
    public ApiResponse modifyInputs(InputsPutRequest request) {
        Long id = request.getId();
        Long curriculumProgressId = request.getCurriculumProgressId();
        Inputs findInputs = inputsRepository.findById(id).orElseThrow(() -> new RuntimeException("존재하지않는 id"));
        CurriculumProgress findCurriculumProgress = progressRepository.findById(curriculumProgressId).orElseThrow(() -> new RuntimeException("존재하지않는 id"));
        findInputs.modifyInputs(request, findCurriculumProgress);
        return new ApiResponse(200, true, "수정 되었습니다.");
    }
}
