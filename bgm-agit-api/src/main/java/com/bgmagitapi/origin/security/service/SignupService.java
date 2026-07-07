package com.bgmagitapi.origin.security.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.security.service.request.SignupRequest;

public interface SignupService {
    ApiResponse signup(SignupRequest request);
}
