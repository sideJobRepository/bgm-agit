package com.bgmagitapi.kml.rule.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;
import com.bgmagitapi.kml.rule.dto.request.RulePutRequest;
import com.bgmagitapi.kml.rule.dto.response.RuleGetResponse;
import com.bgmagitapi.kml.rule.service.RuleService;
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
    public ApiResponse createRule(@Validated @ModelAttribute RulePostRequest request) {
        return ruleService.createRule(request);
    }
    
    @PutMapping("/rule")
    public ApiResponse updateRule(@Validated @ModelAttribute RulePutRequest request) {
        return ruleService.modifyRule(request);
    }
    
    @PutMapping("/rule/{id}")
    public ApiResponse removeRule(@PathVariable Long id) {
        return ruleService.deleteRule(id);
    }
    
}
