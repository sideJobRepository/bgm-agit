package com.bgmagitapi.kml.record.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.record.enums.Wind;
import com.bgmagitapi.kml.record.service.RecordService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RecordServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private RecordService recordService;
    
    @DisplayName("")
    @Test
    void test1() throws IOException {
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
        
        File file1 = new File("src/test/java/com/bgmagitapi/file/사암각.png");
        FileInputStream fis1 = new FileInputStream(file1);
        
        MockMultipartFile multipartFile1 = new MockMultipartFile("파일1", file1.getName(), "image/jpeg", fis1);
        
        
        RecordPostRequest.Yakumans list = RecordPostRequest
                .Yakumans
                .builder()
                .memberId(1L)
                .yakumanName("사암각")
                .files(multipartFile1)
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
        System.out.println("record = " + record);
    }
    @DisplayName("")
    @Test
    void test2(){
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<RecordGetResponse> records = recordService.getRecords(pageRequest);
        
        System.out.println("records = " + records);
        
    }
    @DisplayName("")
    @Test
    void test3(){
        RecordGetDetailResponse recordDetail = recordService.getRecordDetail(7L);
        System.out.println("recordDetail = " + recordDetail);
        
    }
}