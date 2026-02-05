package com.bgmagitapi.kml.history.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.record.entity.Record;

import java.util.List;

public interface MatchsAndRecordHistoryService {
    ApiResponse createMatchsAndRecordHistory(Matchs matchs, List<Record> record);

    ApiResponse updateMatchsAndRecordHistory(Matchs matchs, List<Record> record, String changeReason, Long requestMemberId);
}
