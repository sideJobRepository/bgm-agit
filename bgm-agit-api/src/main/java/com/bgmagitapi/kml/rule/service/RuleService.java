package com.bgmagitapi.kml.rule.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;

public interface RuleService {
    
    ApiResponse createRule(RulePostRequest request);
}
