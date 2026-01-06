package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.repository.CurriculumContRepository;
import com.bgmagitapi.academy.repository.CurriculumRepository;
import com.bgmagitapi.academy.service.CurriculumService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class CurriculumServiceImpl implements CurriculumService {

    private final CurriculumRepository curriculumRepository;
    private final CurriculumContRepository curriculumContRepository;
    
    @Override
    public ApiResponse createCurriculum(CurriculumPostRequest request) {
        return null;
    }
}

