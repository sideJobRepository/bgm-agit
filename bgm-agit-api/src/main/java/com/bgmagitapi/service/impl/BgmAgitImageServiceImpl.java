package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitImageCreateRequest;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.service.BgmAgitImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitImageServiceImpl implements BgmAgitImageService {

    private final BgmAgitImageRepository bgmAgitImageRepository;
    
    
    @Override
    public ApiResponse createBgmAgitImage(BgmAgitImageCreateRequest request) {
        return null;
    }
}
