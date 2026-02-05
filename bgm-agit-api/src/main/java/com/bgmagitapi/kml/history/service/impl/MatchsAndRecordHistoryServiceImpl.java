package com.bgmagitapi.kml.history.service.impl;


import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.history.entity.MatchsHistory;
import com.bgmagitapi.kml.history.entity.RecordHistory;
import com.bgmagitapi.kml.history.enums.ChangeType;
import com.bgmagitapi.kml.history.repository.MatchsHistoryRepository;
import com.bgmagitapi.kml.history.repository.RecordHistoryRepository;
import com.bgmagitapi.kml.history.service.MatchsAndRecordHistoryService;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.record.entity.Record;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MatchsAndRecordHistoryServiceImpl implements MatchsAndRecordHistoryService {

    private final MatchsHistoryRepository matchsHistoryRepository;
    private final RecordHistoryRepository recordHistoryRepository;
    
    
    @Override
    public ApiResponse createMatchsAndRecordHistory(Matchs matchs, List<Record> records) {
        MatchsHistory matchsHistory = MatchsHistory
                .builder()
                .matchsId(matchs.getId())
                .settingId(matchs.getSetting().getId())
                .memberId(matchs.getMember().getBgmAgitMemberId())
                .wind(matchs.getWind())
                .tournamentStatus(matchs.getTournamentStatus())
                .delStatus(matchs.getDelStatus())
                .changeType(ChangeType.CREATE)
                .changeReason("최초 등록")
                .build();
        matchsHistoryRepository.save(matchsHistory);
        
        for (Record record : records) {
            RecordHistory recordHistory = RecordHistory
                    .builder()
                    .matchsHistory(matchsHistory)
                    .recordId(record.getId())
                    .memberId(record.getMember().getBgmAgitMemberId())
                    .recordRank(record.getRecordRank())
                    .recordScore(record.getRecordScore())
                    .recordPoint(record.getRecordPoint())
                    .recordSeat(record.getRecordSeat())
                    .build();
            recordHistoryRepository.save(recordHistory);
        }
        
        return new ApiResponse(200,true,"이력 저장");
    }
    
    @Override
    public ApiResponse updateMatchsAndRecordHistory(Matchs matchs, List<Record> records, String changeReason, Long requestMemberId) {
        MatchsHistory matchsHistory = MatchsHistory
                .builder()
                .matchsId(matchs.getId())
                .settingId(matchs.getSetting().getId())
                .memberId(requestMemberId)
                .wind(matchs.getWind())
                .tournamentStatus(matchs.getTournamentStatus())
                .delStatus(matchs.getDelStatus())
                .changeType(ChangeType.MODIFY)
                .changeReason(changeReason)
                .build();
        matchsHistoryRepository.save(matchsHistory);
    
          for (Record record : records) {
              RecordHistory recordHistory = RecordHistory
                      .builder()
                      .matchsHistory(matchsHistory)
                      .recordId(record.getId())
                      .memberId(record.getMember().getBgmAgitMemberId())
                      .recordRank(record.getRecordRank())
                      .recordScore(record.getRecordScore())
                      .recordPoint(record.getRecordPoint())
                      .recordSeat(record.getRecordSeat())
                      .build();
              recordHistoryRepository.save(recordHistory);
          }
          return new ApiResponse(200,true,"이력 수정");
    }
}
