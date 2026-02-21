package com.bgmagitapi.kml.history.repository.query;

import com.bgmagitapi.kml.history.dto.MatchsAndRecordHistoryResponse;

import java.util.List;

public interface MatchsHistoryQueryRepository {

    List<MatchsAndRecordHistoryResponse> findByHistory(Long matchsId);
}
