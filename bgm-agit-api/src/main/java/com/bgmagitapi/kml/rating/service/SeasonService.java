package com.bgmagitapi.kml.rating.service;

import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;

import java.util.List;

public interface SeasonService {

    List<SeasonOptionResponse> getSeasonOptions();
}
