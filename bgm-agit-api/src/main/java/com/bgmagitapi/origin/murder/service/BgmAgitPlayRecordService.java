package com.bgmagitapi.origin.murder.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.murder.dto.request.PlayRecordCreateRequest;
import com.bgmagitapi.origin.murder.dto.request.PlayRecordModifyRequest;
import com.bgmagitapi.origin.murder.dto.response.AllMemberResponse;
import com.bgmagitapi.origin.murder.dto.response.ExperiencedMemberResponse;
import com.bgmagitapi.origin.murder.dto.response.MemberHistoryResponse;
import com.bgmagitapi.origin.murder.dto.response.PlayRecordDetailResponse;
import com.bgmagitapi.origin.murder.dto.response.PlayRecordListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitPlayRecordService {

    Page<PlayRecordListResponse> getPlayRecords(Pageable pageable, Long gameId, Long memberId, Integer year, Integer month);

    PlayRecordDetailResponse getPlayRecord(Long id, Long memberId, List<String> roles);

    ApiResponse createPlayRecord(PlayRecordCreateRequest request, Long memberId);

    ApiResponse modifyPlayRecord(Long id, PlayRecordModifyRequest request, Long memberId, List<String> roles);

    ApiResponse deletePlayRecord(Long id, Long memberId, List<String> roles);

    MemberHistoryResponse getMemberHistory(Long memberId);

    List<AllMemberResponse> searchMembers(String keyword);

    List<ExperiencedMemberResponse> searchExperienced(Long gameId, List<Long> memberIds, Long excludeRecordId);
}
