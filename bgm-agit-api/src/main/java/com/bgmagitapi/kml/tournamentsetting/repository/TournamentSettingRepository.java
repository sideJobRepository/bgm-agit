package com.bgmagitapi.kml.tournamentsetting.repository;

import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;
import com.bgmagitapi.kml.tournamentsetting.repository.query.TournamentSettingQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentSettingRepository extends JpaRepository<TournamentSetting, Long>, TournamentSettingQueryRepository {
}
