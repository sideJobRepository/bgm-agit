package com.bgmagitapi.kml.tournamentsetting.repository.query;

import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;

public interface TournamentSettingQueryRepository {

    TournamentSetting findByTournamentSetting();

    void updateUseStatusN();
}
