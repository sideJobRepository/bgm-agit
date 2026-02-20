package com.bgmagitapi.kml.yakuman.service.impl;

import com.bgmagitapi.kml.yakuman.dto.response.YakumanGetResponse;
import com.bgmagitapi.kml.yakuman.repository.YakumanRepository;
import com.bgmagitapi.kml.yakuman.service.YakumanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
@RequiredArgsConstructor
@Service
public class YakumanServiceImpl implements YakumanService {
    
    private final YakumanRepository  yakumanRepository;
    
    
    @Override
    public List<YakumanGetResponse> getPivotYakuman() {
         return yakumanRepository.getPivotYakuman();
    }
}
