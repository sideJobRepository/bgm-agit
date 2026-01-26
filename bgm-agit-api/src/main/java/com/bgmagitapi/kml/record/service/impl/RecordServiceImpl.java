package com.bgmagitapi.kml.record.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.record.dto.request.RecordPostRequest;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import com.bgmagitapi.kml.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

    private final RecordRepository recordRepository;
    
    private final MatchsRepository matchsRepository;
    
    @Override
    public ApiResponse createRecord(RecordPostRequest request) {
        
        MatchsWind wind = request.getWind();
        String tournamentStatus = request.getTournamentStatus();
        
        Matchs.builder()
                .wind(wind)
                .build();
        
        
        return null;
    }
}
