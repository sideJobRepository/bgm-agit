package com.bgmagitapi.kml.yakamantype.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.kml.yakamantype.dto.response.YakumanTypeGetResponse;
import com.bgmagitapi.kml.yakamantype.service.YakumanTypeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class YakumanTypeServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private YakumanTypeService yakumanTypeService;
    
    @DisplayName("")
    @Test
    void test(){
        List<YakumanTypeGetResponse> yakumanType = yakumanTypeService.getYakumanType();
        System.out.println("yakumanType = " + yakumanType);
        
    }
}