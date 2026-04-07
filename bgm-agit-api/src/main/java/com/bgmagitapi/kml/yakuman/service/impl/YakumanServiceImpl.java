package com.bgmagitapi.kml.yakuman.service.impl;

import com.bgmagitapi.kml.yakuman.dto.response.YakumanDetailGetResponse;
import com.bgmagitapi.kml.yakuman.dto.response.YakumanGetResponse;
import com.bgmagitapi.kml.yakuman.repository.YakumanRepository;
import com.bgmagitapi.kml.yakuman.service.YakumanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@RequiredArgsConstructor
@Service
public class YakumanServiceImpl implements YakumanService {
    
    private final YakumanRepository  yakumanRepository;
    
    
    @Override
    @Transactional(readOnly = true)
    public Page<YakumanGetResponse> getPivotYakuman(String nickName, Pageable pageable) {
          return yakumanRepository.getPivotYakuman(nickName,pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<YakumanDetailGetResponse> getDetailYakuman(Pageable pageable) {
        return yakumanRepository.getYakuman(pageable);
    }
    
}
