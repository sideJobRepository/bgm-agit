package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.response.InputsCheckGetResponse;
import com.bgmagitapi.academy.entity.CurriculumCont;
import com.bgmagitapi.academy.repository.InputsRepository;
import com.bgmagitapi.academy.service.InputsCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class InputsCheckServiceImpl implements InputsCheckService {
    
    private final InputsRepository inputsRepository;
    
    
    @Override
    public List<InputsCheckGetResponse> getInputsChecks(String className) {
        List<CurriculumCont> byInputsCheck = inputsRepository.findByInputsCheck(className);
        
        return null;
    }
}
