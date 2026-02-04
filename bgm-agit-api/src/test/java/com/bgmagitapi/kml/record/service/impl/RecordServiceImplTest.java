package com.bgmagitapi.kml.record.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.enums.Wind;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import com.bgmagitapi.kml.record.service.RecordService;
import com.bgmagitapi.kml.yakuman.entity.Yakuman;
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
        
          
        File file2 = new File("src/test/java/com/bgmagitapi/file/구련보등.png");
        FileInputStream fis2 = new FileInputStream(file1);
        
        MockMultipartFile multipartFile1 = new MockMultipartFile("파일1", file1.getName(), "image/jpeg", fis1);
        MockMultipartFile multipartFile2 = new MockMultipartFile("파일1", file2.getName(), "image/jpeg", fis2);
        
        
        RecordPostRequest.Yakumans list = RecordPostRequest
                .Yakumans
                .builder()
                .memberId(1L)
                .yakumanName("사암각")
                .yakumanCont("사암각 쯔모")
                .files(multipartFile1)
                .build();
        
        
        RecordPostRequest.Yakumans list2 = RecordPostRequest
                .Yakumans
                .builder()
                .memberId(6L)
                .yakumanName("구련보등")
                .yakumanCont("구련보등 쯔모")
                .files(multipartFile2)
                .build();
        List<RecordPostRequest.Yakumans> result = Arrays.asList(list,list2);
        
        RecordPostRequest y = RecordPostRequest
                .builder()
                .wind(MatchsWind.SOUTH)
                .tournamentStatus("Y")
                .records(list1)
                .yakumans(result)
                .build();
        ApiResponse record = recordService.createRecord(y);
        System.out.println("record = " + record);
    }
    @DisplayName("")
    @Test
    void test3(){
        RecordGetDetailResponse recordDetail = recordService.getRecordDetail(1L);
        System.out.println("recordDetail = " + recordDetail);
    }
    
    @DisplayName("기록 수정 - 점수/순위/야쿠만 수정")
    @Test
    void update_record_success() throws IOException {
        
        RecordPutRequest.Records u1 = RecordPutRequest.Records.builder()
                .recordId(1L)
                .recordScore(45000) // 점수 변경
                .recordSeat(Wind.EAST)
                .memberId(11L)
                .build();
    
        RecordPutRequest.Records u2 = RecordPutRequest.Records.builder()
                .recordId(2L)
                .recordScore(35000)
                .recordSeat(Wind.NORTH)
                .memberId(1L)
                .build();
    
        RecordPutRequest.Records u3 = RecordPutRequest.Records.builder()
                .recordId(3L)
                .recordScore(25000)
                .recordSeat(Wind.SOUTH)
                .memberId(3L)
                .build();
    
        RecordPutRequest.Records u4 = RecordPutRequest.Records.builder()
                .recordId(4L)
                .recordScore(15000)
                .recordSeat(Wind.WEST)
                .memberId(5L)
                .build();
    
        File file = new File("src/test/java/com/bgmagitapi/file/사암각.png");
        MockMultipartFile newFile =
                new MockMultipartFile(
                        "file",
                        file.getName(),
                        "image/png",
                        new FileInputStream(file)
                );
    
        RecordPutRequest.Yakumans y1 = RecordPutRequest.Yakumans.builder()
                .yakumanId(1L)
                .memberId(1L)
                .yakumanName("사암각")
                .yakumanCont("사암각 수정됨")
                .files(newFile)
                .build();
    
        RecordPutRequest updateRequest = RecordPutRequest.builder()
                .matchsId(1L)
                .wind(MatchsWind.SOUTH) // wind 변경
                .tournamentStatus("N")
                .records(List.of(u1, u2, u3, u4))
                .yakumans(List.of(y1))
                .build();
    
        // ===== 수정 실행 =====
        ApiResponse response = recordService.updateRecord(updateRequest);
        System.out.println("response = " + response);
    }
    
    @DisplayName("")
      @Test
      void test2(){
          PageRequest pageRequest = PageRequest.of(0, 10);
          Page<RecordGetResponse> records = recordService.getRecords(pageRequest);
          System.out.println("records = " + records);
      }
    
}