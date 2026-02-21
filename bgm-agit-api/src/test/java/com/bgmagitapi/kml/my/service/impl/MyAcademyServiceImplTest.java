package com.bgmagitapi.kml.my.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.kml.my.dto.response.MyAcademyGetResponse;
import com.bgmagitapi.kml.my.service.MyAcademyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.*;

class MyAcademyServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private MyAcademyService myAcademyService;
    
    @Test
    void test1() {
        PageRequest request = PageRequest.of(0, 10);
        Page<MyAcademyGetResponse> roleUser = myAcademyService.getMyAcademy(request, 1L, "ROLE_ADMIN");
        System.out.println("roleUser = " + roleUser);
    }
}