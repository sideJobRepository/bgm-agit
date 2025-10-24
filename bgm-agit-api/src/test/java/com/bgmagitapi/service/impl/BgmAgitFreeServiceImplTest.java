package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.BgmAgitFreeController;
import com.bgmagitapi.controller.request.BgmAgitFreePostRequest;
import com.bgmagitapi.entity.BgmAgitFree;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitFreeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BgmAgitFreeServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private BgmAgitFreeService bgmAgitFreeService;
    
    @Autowired
    private BgmAgitMemberRepository bgmAgitMemberRepository;
    
    @DisplayName("자유 게시판 작성 테스트")
    @Test
    void test1() throws IOException {
        
        BgmAgitFreePostRequest request = new BgmAgitFreePostRequest(11L, "제목 테스트", "내용 테스트", null);
        
        File file1 = new File("src/test/java/com/bgmagitapi/file/이건 모자가 아니잖아.jpg");
        FileInputStream fis1 = new FileInputStream(file1);
        File file2 = new File("src/test/java/com/bgmagitapi/file/참새작.png");
        FileInputStream fis2 = new FileInputStream(file2);
        
        MockMultipartFile multipartFile1 = new MockMultipartFile(
                   "bgmAgitFree", file1.getName(), "image/jpeg",fis1
           );
        
        MockMultipartFile multipartFile2 = new MockMultipartFile(
                    "bgmAgitFree", file2.getName(), "png",fis2
            );
        
        List<MultipartFile> multipartFile3 = List.of(multipartFile1, multipartFile2);
        request.setFiles(multipartFile3);
        ApiResponse bgmAgitFree = bgmAgitFreeService.createBgmAgitFree(request);
        
        System.out.println("bgmAgitFree = " + bgmAgitFree);
        
    }
}