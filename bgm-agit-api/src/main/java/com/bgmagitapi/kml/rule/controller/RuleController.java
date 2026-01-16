package com.bgmagitapi.kml.rule.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;
import com.bgmagitapi.kml.rule.entity.Rule;
import com.bgmagitapi.kml.rule.service.RuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class RuleController {

    
    private final RuleService ruleService;
    
    @PostMapping("/rule")
    public ApiResponse rule(@RequestBody RulePostRequest request) {
        return ruleService.createRule(request);
    }
    
}
