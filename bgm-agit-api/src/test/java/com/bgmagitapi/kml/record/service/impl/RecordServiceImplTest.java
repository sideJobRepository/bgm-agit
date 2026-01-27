package com.bgmagitapi.kml.record.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.enums.Wind;
import com.bgmagitapi.kml.record.service.RecordService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RecordServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private RecordService recordService;
    
    @DisplayName("")
    @Test
    void test1(){
    // [동]진하: 41700,[남]만두: 36900,[서]민준: 24500,[북]쵸리: 16900
        
        RecordPostRequest.Records build1 = RecordPostRequest.
                Records
                .builder()
                .memberId(1L)
                .recordScore(41700)
                .recordSeat(Wind.EAST)
                .build();
        
        RecordPostRequest.Records build2 = RecordPostRequest.
                Records
                .builder()
                .memberId(3L)
                .recordScore(36900)
                .recordSeat(Wind.SOUTH)
                .build();
        
        
        RecordPostRequest.Records build3 = RecordPostRequest.
                Records
                .builder()
                .memberId(5L)
                .recordScore(24500)
                .recordSeat(Wind.WEST)
                .build();
        
        
        RecordPostRequest.Records build4 = RecordPostRequest.
                Records
                .builder()
                .memberId(6L)
                .recordScore(16900)
                .recordSeat(Wind.NORTH)
                .build();
        
        List<RecordPostRequest.Records> list1 = Arrays.asList(build1, build2, build3, build4);
        RecordPostRequest.Yakumans list = RecordPostRequest
                .Yakumans
                .builder()
                .memberId(1L)
                .yakumanName("구련보등")
                .build();
        List<RecordPostRequest.Yakumans> list2 = Arrays.asList(list);
        
        RecordPostRequest y = RecordPostRequest
                .builder()
                .wind(MatchsWind.SOUTH)
                .tournamentStatus("Y")
                .records(list1)
                .yakumans(list2)
                .build();
        ApiResponse record = recordService.createRecord(y);
        
    }
}