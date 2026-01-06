package com.bgmagitapi.academy.service;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.apiresponse.ApiResponse;

public interface CurriculumService {

    ApiResponse createCurriculum(CurriculumPostRequest request);
}
