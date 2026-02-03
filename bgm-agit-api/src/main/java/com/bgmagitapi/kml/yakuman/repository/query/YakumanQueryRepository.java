package com.bgmagitapi.kml.yakuman.repository.query;

import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;

import java.util.List;

public interface YakumanQueryRepository {
    List<RecordGetDetailResponse.YakumanList> findByMatchsYakuman(Long id);
}
