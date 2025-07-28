package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.controller.response.notice.BgmAgitNoticeResponse;
import com.bgmagitapi.service.BgmAgitNoticeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import static org.junit.jupiter.api.Assertions.*;

class BgmAgitNoticeServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private BgmAgitNoticeService bgmAgitNoticeService;
    
    @DisplayName("")
    @Test
    void test(){
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "bgmAgitNoticeId"));
        
        Page<BgmAgitNoticeResponse> result = bgmAgitNoticeService.getNotice(pageable);
        System.out.println("result = " + result);
    
    }
}