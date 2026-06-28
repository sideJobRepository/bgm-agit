package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.controller.request.BgmAgitGatheringApplyRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringCreateRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringModifyRequest;
import com.bgmagitapi.controller.request.BgmAgitGatheringParticipantUpdateRequest;
import com.bgmagitapi.controller.response.BgmAgitGatheringDetailResponse;
import com.bgmagitapi.controller.response.BgmAgitGatheringListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitGatheringService {

    Page<BgmAgitGatheringListResponse> getGatherings(Pageable pageable, String type, String status);

    BgmAgitGatheringDetailResponse getGatheringDetail(Long gatheringId, Long memberId, List<String> roles);

    ApiResponse createGathering(BgmAgitGatheringCreateRequest request, Long memberId);

    ApiResponse modifyGathering(Long gatheringId, BgmAgitGatheringModifyRequest request, Long memberId, List<String> roles);

    ApiResponse deleteGathering(Long gatheringId, Long memberId, List<String> roles);

    ApiResponse apply(Long gatheringId, BgmAgitGatheringApplyRequest request, Long memberId);

    ApiResponse cancelApply(Long gatheringId, Long memberId);

    ApiResponse updateParticipant(Long gatheringId, Long participantId, BgmAgitGatheringParticipantUpdateRequest request, Long memberId, List<String> roles);
}
