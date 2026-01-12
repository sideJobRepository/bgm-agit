package com.bgmagitapi.academy.controller;


import com.bgmagitapi.academy.dto.request.InputsPostRequest;
import com.bgmagitapi.academy.dto.request.InputsPutRequest;
import com.bgmagitapi.academy.dto.response.InputGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.service.InputsService;
import com.bgmagitapi.apiresponse.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RequestMapping("/bgm-agit")
@RestController
@RequiredArgsConstructor
public class InputsController {
    
    private final InputsService inputsService;
    
    
    @GetMapping("/inputs/class")
    public List<InputsCurriculumGetResponse> inputsCurriculum(@RequestParam String className ,@RequestParam Integer year ) {
         return inputsService.getCurriculum(className,year);
    }
    
    @GetMapping("/inputs")
    public InputGetResponse inputs(@RequestParam String className , @RequestParam LocalDate year) {
        return inputsService.getInputs(className, year);
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
