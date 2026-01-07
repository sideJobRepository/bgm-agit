package com.bgmagitapi.academy.controller;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.dto.response.CurriculumGetResponse;
import com.bgmagitapi.academy.service.CurriculumService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/bgm-agit")
@RestController
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumService curriculumService;
    
    
    @GetMapping("/curriculum")
    public CurriculumGetResponse get(@RequestParam(name = "curriculumId") Long curriculumId) {
        return curriculumService.getCurriculum(curriculumId);
    }
    
    
    @PostMapping("/curriculum")
    public ApiResponse createCurriculum(@RequestBody CurriculumPostRequest request) {
        return curriculumService.createCurriculum(request);
    }
}
