package com.bgmagitapi.kml.record.controller;


import com.bgmagitapi.kml.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bgm-agit")
public class RecordController {

    private final RecordService recordService;
    
    
}
