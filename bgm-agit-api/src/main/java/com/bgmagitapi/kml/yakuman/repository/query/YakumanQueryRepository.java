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

    // 목록(월간/일간 기록)용 — 여러 대국의 역만을 한 번에 조회 (화료자 닉네임 + 역만 이름)
    List<com.bgmagitapi.kml.record.dto.response.RecordGetResponse.YakumanInfo> findByMatchsIds(List<Long> matchsIds);

    List<Yakuman> findByYakumanMatchesId(Long matchsId);
    
    Page<YakumanGetResponse> getPivotYakuman(String nickName,Pageable pageable);
    
    Page<YakumanDetailGetResponse> getYakuman(Pageable pageable);
}
