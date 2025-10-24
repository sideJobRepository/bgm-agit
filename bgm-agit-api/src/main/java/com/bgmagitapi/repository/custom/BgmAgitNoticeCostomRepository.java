package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitNotice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BgmAgitNoticeCostomRepository {

    Page<BgmAgitNotice> getNotices(Pageable pageable, String titleOrCont);
}
