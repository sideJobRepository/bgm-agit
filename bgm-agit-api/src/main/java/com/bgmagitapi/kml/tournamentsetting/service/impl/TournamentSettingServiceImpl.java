package com.bgmagitapi.kml.tournamentsetting.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.tournamentsetting.dto.request.TournamentSettingPostRequest;
import com.bgmagitapi.kml.tournamentsetting.dto.response.TournamentSettingGetResponse;
import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;
import com.bgmagitapi.kml.tournamentsetting.repository.TournamentSettingRepository;
import com.bgmagitapi.kml.tournamentsetting.service.TournamentSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class TournamentSettingServiceImpl implements TournamentSettingService {

    private final TournamentSettingRepository tournamentSettingRepository;

    @Override
    @Transactional(readOnly = true)
    public TournamentSettingGetResponse getTournamentSettings() {
        TournamentSetting findSetting = tournamentSettingRepository.findByTournamentSetting();
        if (findSetting == null) {
            return null;
        }

        return TournamentSettingGetResponse
                .builder()
                .turning(findSetting.getTurning())
                .firstUma(findSetting.getFirstUma())
                .secondUma(findSetting.getSecondUma())
                .thirdUma(findSetting.getThirdUma())
                .fourthUma(findSetting.getFourUma())
                .build();
    }

    @Override
    public ApiResponse createTournamentSettings(TournamentSettingPostRequest request) {
        tournamentSettingRepository.updateUseStatusN();
        TournamentSetting setting = TournamentSetting
                .builder()
                .turning(request.getTurning())
                .firstUma(request.getFirstUma())
                .secondUma(request.getSecondUma())
                .thirdUma(request.getThirdUma())
                .fourUma(request.getFourthUma())
                .useStatus("Y")
                .build();
        tournamentSettingRepository.save(setting);
        return new ApiResponse(200, true, "대회 설정이 저장되었습니다.");
    }
}
