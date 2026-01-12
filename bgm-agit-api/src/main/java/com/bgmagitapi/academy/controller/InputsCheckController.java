package com.bgmagitapi.academy.controller;

import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.service.InputsCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/bgm-agit")
@RestController
@RequiredArgsConstructor
public class InputsCheckController {
    
    private final InputsCheckService inputsCheckService;
    
    @GetMapping("/inputsCheck")
    public InputsCheckGetResponse inputsCurriculum() {
        return inputsCheckService.getInputsChecks();
    }
}
