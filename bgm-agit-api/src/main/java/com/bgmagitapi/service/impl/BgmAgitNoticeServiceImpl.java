package com.bgmagitapi.service.impl;

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
}
