package com.bgmagitapi.kml.yakuman.repository.query;

import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.yakuman.entity.Yakuman;

import java.util.List;

public interface YakumanQueryRepository {
    List<RecordGetDetailResponse.YakumanList> findByMatchsYakuman(Long id);
    
    List<Yakuman> findByYakumanMatchesId(Long matchsId);
}
