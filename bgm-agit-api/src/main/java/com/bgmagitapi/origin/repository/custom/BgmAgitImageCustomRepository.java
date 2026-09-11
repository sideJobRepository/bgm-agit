package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.origin.entity.BgmAgitImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitImageCustomRepository {
    List<BgmAgitMainMenuImageResponse> getMainMenuImage(Long labelGb, String link);
    Page<BgmAgitMainMenuImageResponse> getDetailImage(Long labelGb, String link, Pageable pageable,String category,String name);

    /**
     * 예약 가능한(숨김 아닌) 항목 전체. getMainMenuImage 와 같은 필터를 쓰되 슬롯 계산에 필요한 엔티티를 돌려준다.
     */
    List<BgmAgitImage> findReservableImages(Long labelGb, String link);

}
