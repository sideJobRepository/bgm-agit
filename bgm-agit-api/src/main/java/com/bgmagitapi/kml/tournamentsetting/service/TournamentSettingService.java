package com.bgmagitapi.kml.tournamentsetting.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.kml.tournamentsetting.dto.request.TournamentSettingPostRequest;
import com.bgmagitapi.kml.tournamentsetting.dto.response.TournamentSettingGetResponse;

public interface TournamentSettingService {

    TournamentSettingGetResponse getTournamentSettings();

    ApiResponse createTournamentSettings(TournamentSettingPostRequest request);
}
