package com.bgmagitapi.kml.menu.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import com.bgmagitapi.kml.menu.service.KmlMenuService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class KmlMenuServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private KmlMenuService kmlMenuService;
    
    @DisplayName("메뉴 조회")
    @Test
    void test1(){
        List<KmlMenuGetResponse> byKmlMenu = kmlMenuService.findByKmlMenu();
        System.out.println("byKmlMenu = " + byKmlMenu);
        
    }
}