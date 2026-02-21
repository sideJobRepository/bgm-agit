package com.bgmagitapi.kml.yakuman.repository.query;

import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.yakuman.dto.response.YakumanDetailGetResponse;
import com.bgmagitapi.kml.yakuman.dto.response.YakumanGetResponse;
import com.bgmagitapi.kml.yakuman.entity.Yakuman;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface YakumanQueryRepository {
    List<RecordGetDetailResponse.YakumanList> findByMatchsYakuman(Long id);
    
    List<Yakuman> findByYakumanMatchesId(Long matchsId);
    
    List<YakumanGetResponse> getPivotYakuman(String nickName);
    
    Page<YakumanDetailGetResponse> getYakuman(Pageable pageable);
}
