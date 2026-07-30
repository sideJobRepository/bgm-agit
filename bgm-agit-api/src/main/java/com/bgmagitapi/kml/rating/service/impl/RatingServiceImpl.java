package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.rating.service.RatingService;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final MatchsRepository matchsRepository;

    private final RecordRepository recordRepository;

    @Override
    public void process(Long matchsId) {
        // records: 하나의 매치에 대해 각각 사용자별 점수
        List<Record> records = recordRepository.findRecordsByMatchsId(matchsId);

        // TODO: Rating db 설계된거로 도메인 만들고 구현. 일단 가중치없이

    }
}
