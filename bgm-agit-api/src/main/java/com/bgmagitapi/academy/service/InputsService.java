package com.bgmagitapi.academy.service;

import com.bgmagitapi.academy.dto.request.InputsPostRequest;
import com.bgmagitapi.academy.dto.request.InputsPutRequest;
import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.apiresponse.ApiResponse;

import java.time.LocalDate;
import java.util.List;

public interface InputsService {
    List<InputsCurriculumGetResponse> getCurriculum(String className, Integer year);
    
    InputGetResponse getInputs(String className, LocalDate date);
    
    ApiResponse createInputs(InputsPostRequest request);
    
    ApiResponse modifyInputs(InputsPutRequest request);
    
}
