package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitNotice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitNoticeCostomRepository {

    Page<BgmAgitNotice> getNotices(Pageable pageable, String titleOrCont);
    
    List<BgmAgitNotice> getPopupNotices();
}
