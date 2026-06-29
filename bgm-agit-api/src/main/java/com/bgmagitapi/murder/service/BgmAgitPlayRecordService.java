package com.bgmagitapi.murder.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.murder.dto.request.PlayRecordCreateRequest;
import com.bgmagitapi.murder.dto.request.PlayRecordModifyRequest;
import com.bgmagitapi.murder.dto.response.AllMemberResponse;
import com.bgmagitapi.murder.dto.response.ExperiencedMemberResponse;
import com.bgmagitapi.murder.dto.response.MemberHistoryResponse;
import com.bgmagitapi.murder.dto.response.PlayRecordDetailResponse;
import com.bgmagitapi.murder.dto.response.PlayRecordListResponse;
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
