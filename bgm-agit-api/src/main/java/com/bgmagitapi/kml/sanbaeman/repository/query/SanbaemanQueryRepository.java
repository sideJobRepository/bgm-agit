package com.bgmagitapi.kml.sanbaeman.repository.query;

import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanDetailGetResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanPivotResponse;
import com.bgmagitapi.kml.sanbaeman.entity.Sanbaeman;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SanbaemanQueryRepository {
    List<RecordGetDetailResponse.SanbaemanList> findByMatchsSanbaeman(Long id);

    // 목록(월간/일간 기록)용 — 여러 대국의 삼배만을 한 번에 조회 (화료자 닉네임)
    List<com.bgmagitapi.kml.record.dto.response.RecordGetResponse.SanbaemanInfo> findByMatchsIds(List<Long> matchsIds);

    List<Sanbaeman> findBySanbaemanMatchesId(Long matchsId);

    Page<SanbaemanPivotResponse> getPivotSanbaeman(String nickName, Pageable pageable);

    Page<SanbaemanDetailGetResponse> getSanbaeman(Pageable pageable);
}
