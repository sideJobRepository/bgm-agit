package com.bgmagitapi.kml.yakamantype.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.kml.yakamantype.dto.response.MembersGetResponse;
import com.bgmagitapi.kml.yakamantype.dto.response.YakumanTypeGetResponse;
import com.bgmagitapi.kml.yakamantype.service.YakumanTypeService;
import com.bgmagitapi.kml.yakuman.dto.response.YakumanGetResponse;
import com.bgmagitapi.kml.yakuman.service.YakumanService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class YakumanTypeServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private YakumanTypeService yakumanTypeService;
    
    @Autowired
    private YakumanService yakumanService;
    
    @DisplayName("")
    @Test
    void test(){
        List<YakumanTypeGetResponse> yakumanType = yakumanTypeService.getYakumanType();
        System.out.println("yakumanType = " + yakumanType);
    }
    
    
    @DisplayName("")
    @Test
    void test2(){
        List<MembersGetResponse> nickName = yakumanTypeService.getNickName();
        System.out.println("nickName = " + nickName);
    }
    
    @DisplayName("")
    @Test
    void test3(){
        List<YakumanGetResponse> pivotYakuman = yakumanService.getPivotYakuman();
        System.out.println("pivotYakuman = " + pivotYakuman);
    }
    
    
}