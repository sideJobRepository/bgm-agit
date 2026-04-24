package com.bgmagitapi.security.controller;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.security.service.SignupService;
import com.bgmagitapi.security.service.request.SignupRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class SignupController {

    private final SignupService signupService;

    @PostMapping("/next/signup")
    public ApiResponse signup(@Valid @RequestBody SignupRequest request) {
        return signupService.signup(request);
    }
}
