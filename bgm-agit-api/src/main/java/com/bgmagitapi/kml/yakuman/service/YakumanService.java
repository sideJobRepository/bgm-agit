package com.bgmagitapi.kml.yakuman.service;

import com.bgmagitapi.kml.yakuman.dto.response.YakumanDetailGetResponse;
import com.bgmagitapi.kml.yakuman.dto.response.YakumanGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface YakumanService {
    
    Page<YakumanGetResponse> getPivotYakuman(String nickName, Pageable pageable);
    
    Page<YakumanDetailGetResponse> getDetailYakuman(Pageable pageable);
}
