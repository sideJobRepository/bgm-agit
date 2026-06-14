package com.bgmagitapi.kml.sanbaeman.service;

import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanDetailGetResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanPivotResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SanbaemanService {

    Page<SanbaemanPivotResponse> getPivotSanbaeman(String nickName, Pageable pageable);

    Page<SanbaemanDetailGetResponse> getDetailSanbaeman(Pageable pageable);
}
