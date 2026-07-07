package com.bgmagitapi.origin.clocktower.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRecordCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerRecordModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRecordDetailResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerRecordListResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitClockTowerRecordService {

    Page<ClockTowerRecordListResponse> getRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month,
                                                  Long viewerId, boolean isAdmin);

    ClockTowerRecordDetailResponse getRecord(Long id, Long memberId, List<String> roles);

    ApiResponse createRecord(ClockTowerRecordCreateRequest request, Long memberId);

    ApiResponse modifyRecord(Long id, ClockTowerRecordModifyRequest request, Long memberId, List<String> roles);

    ApiResponse deleteRecord(Long id, Long memberId, List<String> roles);

    MemberHistoryResponse getMemberHistory(Long memberId);
}
