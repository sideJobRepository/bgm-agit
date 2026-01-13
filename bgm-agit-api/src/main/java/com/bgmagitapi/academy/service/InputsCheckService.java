package com.bgmagitapi.academy.service;

import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;

import java.time.LocalDate;

public interface InputsCheckService {

    
    InputsCheckGetResponse getInputsChecks(LocalDate years);

}
