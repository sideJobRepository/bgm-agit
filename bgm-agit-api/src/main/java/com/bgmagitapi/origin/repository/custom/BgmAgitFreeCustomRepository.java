package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.BgmAgitFreeGetDetailResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitFreeGetResponse;
import com.bgmagitapi.origin.entity.BgmAgitFree;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitFreeCustomRepository {
    
    Page<BgmAgitFreeGetResponse> findByAllBgmAgitFree(Pageable pageable,String titleOrCont);
    BgmAgitFree findByIdAndMemberId(Long id, BgmAgitMember bgmAgitMember);
    
    BgmAgitFreeGetDetailResponse findByFreeDetail(Long id,Long memberId);
    
    List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseFile> findFiles(Long id);
    List<BgmAgitFreeGetDetailResponse.BgmAgitFreeGetDetailResponseComment> findComments(Long id, Long memberId);
    
    Long deleteByIdAndMember(Long id, BgmAgitMember bgmAgitMember);
}
