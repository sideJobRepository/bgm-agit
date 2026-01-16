package com.bgmagitapi.kml.rule.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.rule.dto.request.RulePostRequest;
import com.bgmagitapi.kml.rule.dto.response.RuleGetResponse;
import com.bgmagitapi.kml.rule.service.RuleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RuleServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private RuleService ruleService;
    
    @DisplayName("")
    @Test
    void test1() throws IOException {
        
        
        File file1 = new File("src/test/java/com/bgmagitapi/file/복합기.jpg");
        FileInputStream fis1 = new FileInputStream(file1);
        MockMultipartFile multipartFile1 = new MockMultipartFile("파일1", file1.getName(), "image/jpeg", fis1);
        List<MultipartFile> files = List.of(multipartFile1);
        
        RulePostRequest result = RulePostRequest
                .builder()
                .title("대회룰")
                .tournamentStatus(true)
                .files(files)
                .build();
        
        ApiResponse rule = ruleService.createRule(result);
        System.out.println("rule = " + rule);
    }
    
    @DisplayName("")
    @Test
    void test2(){
        List<RuleGetResponse> rules = ruleService.getRules();
        System.out.println("rules = " + rules);
        
    }
}