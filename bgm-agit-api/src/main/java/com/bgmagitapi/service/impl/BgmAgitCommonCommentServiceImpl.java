package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPostRequest;
import com.bgmagitapi.controller.request.BgmAgitCommonCommentPutRequest;
import com.bgmagitapi.repository.BgmAgitCommonCommentRepository;
import com.bgmagitapi.service.BgmAgitCommonCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@RequiredArgsConstructor
@Service
public class BgmAgitCommonCommentServiceImpl implements BgmAgitCommonCommentService {
    
    private final BgmAgitCommonCommentRepository bgmAgitCommonCommentRepository;
    
    
    @Override
    public ApiResponse createComment(BgmAgitCommonCommentPostRequest request) {
        return null;
    }
    
    @Override
    public ApiResponse modifyComment(BgmAgitCommonCommentPutRequest request) {
        return null;
    }
}
