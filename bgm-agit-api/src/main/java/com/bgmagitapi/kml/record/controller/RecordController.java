package com.bgmagitapi.kml.record.controller;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class RecordController {

    private final RecordService recordService;
    
    @PostMapping("/record")
    public ApiResponse createRecord(@Validated @RequestBody RecordPostRequest request) {
        return recordService.createRecord(request);
    }
}
