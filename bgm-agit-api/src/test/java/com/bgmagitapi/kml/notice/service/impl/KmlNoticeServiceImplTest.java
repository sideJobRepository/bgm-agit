package com.bgmagitapi.kml.notice.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.notice.dto.enums.FileStatus;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePutRequest;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetDetailResponse;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetResponse;
import com.bgmagitapi.kml.notice.service.KmlNoticeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

class KmlNoticeServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private KmlNoticeService kmlNoticeService;
    
    
    @DisplayName("")
    @Test
    void test1() {
        
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<KmlNoticeGetResponse> kmlNotice = kmlNoticeService.getKmlNotice(pageRequest, null);
        System.out.println("kmlNotice = " + kmlNotice);
        
        LocalDate localDate = LocalDate.of(2026, 1, 9);
        LocalDate localDate1 = localDate.plusDays(30);
        System.out.println("localDate1 = " + localDate1);
        
        
    }
    
    @DisplayName("")
    @Test
    void test2() throws IOException {

//        File file1 = new File("src/test/java/com/bgmagitapi/file/이건 모자가 아니잖아.jpg");
//        FileInputStream fis1 = new FileInputStream(file1);
//        File file2 = new File("src/test/java/com/bgmagitapi/file/참새작.png");
//        FileInputStream fis2 = new FileInputStream(file2);
//
//        File file3 = new File("src/test/java/com/bgmagitapi/file/복합기.jpg");
//        FileInputStream fis3 = new FileInputStream(file3);
//
//        MockMultipartFile multipartFile1 = new MockMultipartFile("파일1", file1.getName(), "image/jpeg", fis1);
//        MockMultipartFile multipartFile2 = new MockMultipartFile("파일2", file2.getName(), "png", fis2);
//        MockMultipartFile multipartFile3 = new MockMultipartFile("파일3", file3.getName(), "png", fis3);
//
//        //List<MultipartFile> files = List.of(multipartFile1, multipartFile2);
//        List<MultipartFile> files = List.of(multipartFile3);
        
        for (int i = 0; i < 30; i++) {
            KmlNoticePostRequest result = KmlNoticePostRequest
                    .builder()
                    .title("제목길~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~게" + i)
                    .cont("내용길~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~게" + i)
                    .files(null)
                    .build();
            
            ApiResponse kmlNotice = kmlNoticeService.createKmlNotice(result);
            System.out.println("kmlNotice = " + kmlNotice);
        }
        
        
    }
    
    @DisplayName("")
    @Test
    void test3() {
        KmlNoticeGetDetailResponse detailKmlNotice = kmlNoticeService.getDetailKmlNotice(20L);
        System.out.println("detailKmlNotice = " + detailKmlNotice);
    }
    
    @DisplayName("")
    @Test
    void test4() {
        ApiResponse apiResponse = kmlNoticeService.removeKmlNotice(1L);
        System.out.println("apiResponse = " + apiResponse);
    }
    
    @DisplayName("")
    @Test
    void test5() throws IOException {
        
        File file1 = new File("src/test/java/com/bgmagitapi/file/이건 모자가 아니잖아.jpg");
        FileInputStream fis1 = new FileInputStream(file1);
        File file2 = new File("src/test/java/com/bgmagitapi/file/참새작.png");
        FileInputStream fis2 = new FileInputStream(file2);
        MockMultipartFile multipartFile1 = new MockMultipartFile("파일1", file1.getName(), "image/jpeg", fis1);
        MockMultipartFile multipartFile2 = new MockMultipartFile("파일2", file2.getName(), "png", fis2);
        List<MultipartFile> files = List.of(multipartFile1, multipartFile2);
        KmlNoticePutRequest build2 = KmlNoticePutRequest
                .builder()
                .id(3L)
                .title("수정")
                .cont("수정내용")
                .files(files)
                .deleteFileIds(null)
                .build();
        ApiResponse result = kmlNoticeService.modifyKmlNotice(build2);
        System.out.println("result = " + result);
    }
}