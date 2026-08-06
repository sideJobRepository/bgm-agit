package com.bgmagitapi.kml.rating.service;

import com.bgmagitapi.kml.rating.dto.TierResponse;
import com.bgmagitapi.kml.rating.dto.TierSaveRequest;

import java.util.List;

public interface TierService {

    List<TierResponse> getTiers(Long seasonId);

    // 특정 시즌의 등급 목록을 통째로 덮어써 저장
    List<TierResponse> saveTiers(Long seasonId, TierSaveRequest request);

}
