package com.bgmagitapi.kml.rating.service;

import com.bgmagitapi.kml.rating.dto.TierResponse;

import java.util.List;

public interface TierService {

    List<TierResponse> getTiers(Long seasonId);

}
