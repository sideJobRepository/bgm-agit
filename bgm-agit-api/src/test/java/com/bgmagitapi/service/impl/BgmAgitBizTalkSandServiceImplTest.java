package com.bgmagitapi.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitMemberRole;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitBizTalkSandService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class BgmAgitBizTalkSandServiceImplTest extends RepositoryAndServiceTestSupport {

    
    @Autowired
    private BgmAgitBizTalkSandService bgmAgitBizTalkSandService;
    
    @Autowired
    private BgmAgitMemberRepository bgmAgitMemberRepository;
    
    @DisplayName("회원 가입시 관리자에게 알림톡")
    @Test
    void test1(){
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(4L).orElse(null);
        
        bgmAgitBizTalkSandService.sendJoinMemberBizTalk(bgmAgitMember);
        
    }

}