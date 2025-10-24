package com.bgmagitapi.repository.custom;

import com.bgmagitapi.controller.response.BgmAgitFreeGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BgmAgitFreeCustomRepository {

    Page<BgmAgitFreeGetResponse> findByAllBgmAgitFree(Pageable pageable);
}
