package com.bgmagitapi.kml.history.controller;


import com.bgmagitapi.kml.history.dto.MatchsAndRecordHistoryResponse;
import com.bgmagitapi.kml.history.service.MatchsAndRecordHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bgm-agit")
@RequiredArgsConstructor
public class HistoryController {

    private final MatchsAndRecordHistoryService matchsAndRecordHistoryService;
    
    
    @GetMapping("/history/{matchsId}")
    public List<MatchsAndRecordHistoryResponse> getHistory(@PathVariable Long matchsId) {
        return matchsAndRecordHistoryService.getMatchsAndRecordHistory(matchsId);
    }
}
