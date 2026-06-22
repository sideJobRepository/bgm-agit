package com.bgmagitapi.kml.record.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.dto.request.RecordPutRequest;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.yakamantype.dto.response.MembersGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RecordService {
    Page<RecordGetResponse> getRecords(Pageable pageable, String startDate, String endDate, String nickName, String tournamentStatus, String bonusType, List<String> roles);
    RecordGetDetailResponse getRecordDetail(Long id);

    /** 기록 입력 화면용: 최근 기록에 등장한 MAHJONG 회원 목록 (최근순 distinct) */
    List<MembersGetResponse> getRecentMembers();
    ApiResponse createRecord(RecordPostRequest request, Long memberId);
    ApiResponse updateRecord(RecordPutRequest request, Long memberId);

    ApiResponse removeRecord(Long id, Long memberId);

    ApiResponse restoreRecord(Long id, List<String> roles);
}
