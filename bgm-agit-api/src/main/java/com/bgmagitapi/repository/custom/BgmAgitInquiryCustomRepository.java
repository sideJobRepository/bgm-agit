package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitInquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitInquiryCustomRepository {
    
    Page<BgmAgitInquiry> findByInquirys(Long memberId, boolean isUser, Pageable pageable, String titleOrCont);
    
    List<BgmAgitInquiry> findByDetailInquiry(Long inquiryId);
    
    Long deleteByInquiry(Long id);
}
