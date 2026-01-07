package com.bgmagitapi.academy.service.impl;

import com.bgmagitapi.academy.dto.response.InputsCurriculumGetResponse;
import com.bgmagitapi.academy.repository.InputsRepository;
import com.bgmagitapi.academy.service.InputsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Transactional
@RequiredArgsConstructor
@Service
public class InputsServiceImpl implements InputsService {

    private final InputsRepository inputsRepository;
    
    @Override
    public List<InputsCurriculumGetResponse> getCurriculum(String className) {
        return inputsRepository.findByCurriculum(className);
    }
}
