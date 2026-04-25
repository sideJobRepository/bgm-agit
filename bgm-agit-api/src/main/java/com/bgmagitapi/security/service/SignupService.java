package com.bgmagitapi.security.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.security.service.request.SignupRequest;

public interface SignupService {
    ApiResponse signup(SignupRequest request);
}
