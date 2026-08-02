package com.bgmagitapi.kml.rating.service.impl;

import com.bgmagitapi.kml.rating.dto.SeasonOptionResponse;
import com.bgmagitapi.kml.rating.enums.SeasonProgressStatus;
import com.bgmagitapi.kml.rating.repository.SeasonRepository;
import com.bgmagitapi.kml.rating.service.SeasonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SeasonServiceImpl implements SeasonService {

    private final SeasonRepository seasonRepository;

    @Override
    public List<SeasonOptionResponse> getSeasonOptions() {
        return Stream.concat(
                        seasonRepository.findAllByProgressStatus(SeasonProgressStatus.ONGOING).stream(),
                        seasonRepository.findAllByProgressStatus(SeasonProgressStatus.CLOSED).stream()
                )
                .map(SeasonOptionResponse::fromDomain)
                .toList();
    }
}
