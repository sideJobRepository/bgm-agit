package com.bgmagitapi.kml.yakuman.service;

import com.bgmagitapi.kml.yakuman.dto.response.YakumanGetResponse;

import java.util.List;

public interface YakumanService {

    List<YakumanGetResponse> getPivotYakuman();
}
