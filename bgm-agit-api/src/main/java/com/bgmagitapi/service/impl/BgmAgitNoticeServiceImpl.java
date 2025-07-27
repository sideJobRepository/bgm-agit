package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitNoticeCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitNoticeModifyRequest;
import com.bgmagitapi.controller.response.BgmAgitNoticeResponse;
import com.bgmagitapi.entity.BgmAgitNotice;
import com.bgmagitapi.repository.BgmAgitNoticeRepository;
import com.bgmagitapi.service.BgmAgitNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class BgmAgitNoticeServiceImpl implements BgmAgitNoticeService {
    
    private final BgmAgitNoticeRepository bgmAgitNoticeRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<BgmAgitNoticeResponse> getNotice() {
        List<BgmAgitNotice> all = bgmAgitNoticeRepository.findAll();
        return all.stream()
                .map(item -> new BgmAgitNoticeResponse(
                        item.getBgmAgitNoticeId(),
                        item.getBgmAgitNoticeTitle(),
                        item.getBgmAgitNoticeCont(),
                        item.getBgmAgitNoticeType().name()
                
                )).toList();
    }
    
    @Override
    public ApiResponse createNotice(BgmAgitNoticeCreateRequest request) {
        BgmAgitNotice bgmAgitNotice = new BgmAgitNotice(request.getBgmAgitNoticeTitle(), request.getBgmAgitNoticeTitle(), request.getBgmAgitNoticeType());
        bgmAgitNoticeRepository.save(bgmAgitNotice);
        return new ApiResponse(200, true, "공지사항 저장이 성공했습니다.");
    }
    
    @Override
    public ApiResponse modifyNotice(BgmAgitNoticeModifyRequest request) {
        
        return null;
    }
    
    @Override
    public ApiResponse deleteNotice(Integer noticeId) {
        return null;
    }
}
