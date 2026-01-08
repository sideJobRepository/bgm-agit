package com.bgmagitapi.academy.controller;


import com.bgmagitapi.academy.dto.request.InputsPostRequest;
import com.bgmagitapi.academy.dto.request.InputsPutRequest;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.service.InputsService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/bgm-agit")
@RestController
@RequiredArgsConstructor
public class InputsController {
    
    private final InputsService inputsService;
    
    
    @GetMapping("/inputs/class")
    public List<InputsCurriculumGetResponse> inputsCurriculum(@RequestParam String className) {
         return inputsService.getCurriculum(className);
    }
    
    @PostMapping("/inputs")
    public ApiResponse createInputs(@RequestBody InputsPostRequest request) {
        return inputsService.createInputs(request);
    }
    
    @PutMapping("/inputs")
    public ApiResponse updateInputs(@RequestBody InputsPutRequest request) {
        return inputsService.modifyInputs(request);
    }
    
}
