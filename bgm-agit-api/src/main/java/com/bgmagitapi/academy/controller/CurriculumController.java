package com.bgmagitapi.academy.controller;

import com.bgmagitapi.academy.dto.request.CurriculumPostRequest;
import com.bgmagitapi.academy.dto.request.CurriculumPutRequest;
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
    public CurriculumGetResponse get(@RequestParam(name = "year") Integer year, @RequestParam(name = "className") String className) {
        return curriculumService.getCurriculum(year,className);
    }
    
    
    @PostMapping("/curriculum")
    public ApiResponse createCurriculum(@RequestBody CurriculumPostRequest request) {
        return curriculumService.createCurriculum(request);
    }
    
    @PutMapping("/curriculum")
    public ApiResponse updateCurriculum(@RequestBody CurriculumPutRequest request) {
        return curriculumService.modifyCurriculum(request);
    }
}
