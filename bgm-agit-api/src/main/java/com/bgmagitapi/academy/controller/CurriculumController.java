package com.bgmagitapi.academy.controller;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.service.CurriculumService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/bgm-agit")
@RestController
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumService curriculumService;
    
    
    @PostMapping("/curriculum")
    public ApiResponse createCurriculum(@RequestBody CurriculumPostRequest request) {
        return curriculumService.createCurriculum(request);
    }
}
