package com.bgmagitapi.academy.controller;


import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.service.InputsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/bgm-agit")
@RestController
@RequiredArgsConstructor
public class InputsController {
    
    private final InputsService inputsService;
    
    
    @GetMapping("/inputs")
    public List<InputsCurriculumGetResponse> inputsCurriculum(@RequestParam String className) {
         return inputsService.getCurriculum(className);
    }
    
}
