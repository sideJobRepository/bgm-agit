package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.RepositoryAndServiceTestSupport;
import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;
import com.bgmagitapi.academy.service.InputsCheckService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class InputsCheckServiceImplTest extends RepositoryAndServiceTestSupport {
    
    
    @Autowired
    private InputsCheckService inputsCheckService;
    
    
    @DisplayName("")
    @Test
    void test1(){
        InputsCheckGetResponse inputsChecks = inputsCheckService.getInputsChecks("3g");
        
        System.out.println("inputsChecks = " + inputsChecks);
        
    }
}