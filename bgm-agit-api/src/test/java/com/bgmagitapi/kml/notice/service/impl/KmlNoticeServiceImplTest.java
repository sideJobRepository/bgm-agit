package com.bgmagitapi.kml.notice.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.notice.dto.request.KmlNoticePostRequest;
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
import java.io.IOException;
import java.util.List;

class KmlNoticeServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private KmlNoticeService kmlNoticeService;
    
    
    @DisplayName("")
    @Test
    void test1() {
        
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<KmlNoticeGetResponse> kmlNotice = kmlNoticeService.getKmlNotice(pageRequest, titleAndCont);
        System.out.println("kmlNotice = " + kmlNotice);
    }
    
    @DisplayName("")
    @Test
    void test2() throws IOException {
        
        File file1 = new File("src/test/java/com/bgmagitapi/file/이건 모자가 아니잖아.jpg");
        FileInputStream fis1 = new FileInputStream(file1);
        File file2 = new File("src/test/java/com/bgmagitapi/file/참새작.png");
        FileInputStream fis2 = new FileInputStream(file2);
        
        File file3 = new File("src/test/java/com/bgmagitapi/file/복합기.jpg");
        FileInputStream fis3 = new FileInputStream(file3);
        
        MockMultipartFile multipartFile1 = new MockMultipartFile("파일1", file1.getName(), "image/jpeg", fis1);
        
        MockMultipartFile multipartFile2 = new MockMultipartFile("파일2", file2.getName(), "png", fis2);
        MockMultipartFile multipartFile3 = new MockMultipartFile("파일3", file3.getName(), "png", fis3);
        
        //List<MultipartFile> files = List.of(multipartFile1, multipartFile2);
        List<MultipartFile> files = List.of(multipartFile3);
        KmlNoticePostRequest result = KmlNoticePostRequest
                .builder()
                .title("제목3")
                .cont("테스트3")
                .files(files)
                .build();
        
        ApiResponse kmlNotice = kmlNoticeService.createKmlNotice(result);
        System.out.println("kmlNotice = " + kmlNotice);
    }
}