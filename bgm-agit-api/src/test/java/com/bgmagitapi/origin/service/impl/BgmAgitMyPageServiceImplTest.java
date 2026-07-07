package com.bgmagitapi.origin.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.origin.controller.response.notice.BgmAgitMyPagePutRequest;
import com.bgmagitapi.origin.service.BgmAgitMyPageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

class BgmAgitMyPageServiceImplTest extends RepositoryAndServiceTestSupport {
    
    @Autowired
    private BgmAgitMyPageService bgmAgitMyPageService;
    
    @Test
    void getMyPage() {
        
        BgmAgitMyPageGetResponse myPage = bgmAgitMyPageService.getMyPage(1L);
        System.out.println("myPage = " + myPage);
        
    }
    
    @Test
    void modifyMyPage() {
        
     //   BgmAgitMyPagePutRequest bgmAgitMyPagePutRequest = new BgmAgitMyPagePutRequest(14L, "배성환", "010-6280-7022", "Y","Y");
   //     ApiResponse apiResponse = bgmAgitMyPageService.modifyMyPage(bgmAgitMyPagePutRequest);
        
    }
}