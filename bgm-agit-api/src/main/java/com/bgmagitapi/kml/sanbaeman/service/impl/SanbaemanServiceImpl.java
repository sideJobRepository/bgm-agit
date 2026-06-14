package com.bgmagitapi.kml.sanbaeman.service.impl;

import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanDetailGetResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanPivotResponse;
import com.bgmagitapi.kml.sanbaeman.repository.SanbaemanRepository;
import com.bgmagitapi.kml.sanbaeman.service.SanbaemanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@RequiredArgsConstructor
@Service
public class SanbaemanServiceImpl implements SanbaemanService {

    private final SanbaemanRepository sanbaemanRepository;


    @Override
    @Transactional(readOnly = true)
    public Page<SanbaemanPivotResponse> getPivotSanbaeman(String nickName, Pageable pageable) {
        return sanbaemanRepository.getPivotSanbaeman(nickName, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SanbaemanDetailGetResponse> getDetailSanbaeman(Pageable pageable) {
        return sanbaemanRepository.getSanbaeman(pageable);
    }

}
