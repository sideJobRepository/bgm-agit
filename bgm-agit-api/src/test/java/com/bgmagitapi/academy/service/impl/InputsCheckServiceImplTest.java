package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;
import com.bgmagitapi.academy.service.InputsCheckService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

class InputsCheckServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private InputsCheckService inputsCheckService;
    
    
    @DisplayName("")
    @Test
    void test1() throws JsonProcessingException {
        InputsCheckGetResponse inputsChecks = inputsCheckService.getInputsChecks(LocalDate.now());
        
        System.out.println("inputsChecks = " + inputsChecks);
        
    }
}