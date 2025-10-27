package com.bgmagitapi.repository.custom;

import com.bgmagitapi.controller.response.BgmAgitFreeGetDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.entity.BgmAgitFree;
import com.bgmagitapi.entity.BgmAgitMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitFreeCustomRepository {
    
    Page<BgmAgitFreeGetResponse> findByAllBgmAgitFree(Pageable pageable);
    BgmAgitFree findByIdAndMemberId(Long id, BgmAgitMember bgmAgitMember);
    
    BgmAgitFreeGetDetailResponse findByFreeDetail(Long id,Long memberId);
    
    List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseFile> findFiles(Long id);
    List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment> findComments(Long id, Long memberId);
}
