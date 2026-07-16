package com.bgmagitapi.kml.password.controller;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.kml.password.dto.request.BgmAgitPasswordRequest;
import com.bgmagitapi.kml.password.service.BgmAgitPasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bgm-agit")
@RequiredArgsConstructor
public class BgmAgitPasswordController {

    private final BgmAgitPasswordService bgmAgitPasswordService;

    @PutMapping("/score-password")
    public ApiResponse changePassword(@Validated @RequestBody BgmAgitPasswordRequest request) {
        return bgmAgitPasswordService.changePassword(request);
    }
}
