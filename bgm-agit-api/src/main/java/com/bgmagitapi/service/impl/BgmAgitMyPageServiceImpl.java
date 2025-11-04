package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.controller.response.notice.BgmAgitMyPagePutRequest;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitMyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitMyPageServiceImpl implements BgmAgitMyPageService {
    
    private final BgmAgitMemberRepository  bgmAgitMemberRepository;
    
    @Override
    public BgmAgitMyPageGetResponse getMyPage(Long id) {
        return bgmAgitMemberRepository.findByMyPage(id);
    }
    
    @Override
    public ApiResponse modifyMyPage(BgmAgitMyPagePutRequest request) {
        BgmAgitMember bgmAgitMember = bgmAgitMemberRepository.findById(request.getId()).orElseThrow(() -> new RuntimeException("존재 하지 않는 회원입니다."));
        bgmAgitMember.modifyMyPage(request);
        return new ApiResponse(200,true,"내정보 가 수정되었습니다.");
    }
}
