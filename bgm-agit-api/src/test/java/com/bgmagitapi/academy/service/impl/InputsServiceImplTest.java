package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.service.InputsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class InputsServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private InputsService inputsService;
    
    @DisplayName("")
    @Test
    void test1(){
        List<InputsCurriculumGetResponse> curriculum = inputsService.getCurriculum("3g");
        System.out.println("curriculum = " + curriculum);
    }
}