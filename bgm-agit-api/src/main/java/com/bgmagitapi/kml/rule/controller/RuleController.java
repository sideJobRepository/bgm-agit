package com.bgmagitapi.kml.rule.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;
import com.bgmagitapi.kml.rule.dto.response.RuleGetResponse;
import com.bgmagitapi.kml.rule.entity.Rule;
import com.bgmagitapi.kml.rule.service.RuleService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class RuleController {

    
    private final RuleService ruleService;
    
    @GetMapping("/rule")
    public List<RuleGetResponse> getRules() {
        return ruleService.getRules();
    }
    
    @PostMapping("/rule")
    public ApiResponse rule(@Validated @ModelAttribute RulePostRequest request) {
        return ruleService.createRule(request);
    }
    
}
