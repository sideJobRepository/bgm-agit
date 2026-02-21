package com.bgmagitapi.kml.history.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.kml.history.dto.MatchsAndRecordHistoryResponse;
import com.bgmagitapi.kml.history.service.MatchsAndRecordHistoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

class MatchsAndRecordHistoryServiceImplTest extends RepositoryAndServiceTestSupport {
   
    @Autowired
    private MatchsAndRecordHistoryService matchsHistoryService;
    
    
    @DisplayName("")
    @Test
    void test1(){
        List<MatchsAndRecordHistoryResponse> matchsAndRecordHistory = matchsHistoryService.getMatchsAndRecordHistory(1L);
        System.out.println("matchsAndRecordHistory = " + matchsAndRecordHistory);
    }
}