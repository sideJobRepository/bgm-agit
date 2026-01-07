package com.bgmagitapi.academy.service;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.dto.request.CurriculumPutRequest;
import com.bgmagitapi.academy.dto.response.CurriculumGetResponse;
import com.bgmagitapi.apiresponse.ApiResponse;

public interface CurriculumService {
    
    CurriculumGetResponse getCurriculum(Integer year , String className);
    
    ApiResponse createCurriculum(CurriculumPostRequest request);
    
    ApiResponse modifyCurriculum(CurriculumPutRequest request);
}
