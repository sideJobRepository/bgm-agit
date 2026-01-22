package com.bgmagitapi.kml.rule.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;
import com.bgmagitapi.kml.rule.dto.request.RulePutRequest;
import com.bgmagitapi.kml.rule.dto.response.RuleGetResponse;

import java.util.List;

public interface RuleService {
    
    List<RuleGetResponse> getRules();
    
    ApiResponse createRule(RulePostRequest request);
    
    ApiResponse modifyRule(RulePutRequest request);
    
    ApiResponse deleteRule(Long id);
}
