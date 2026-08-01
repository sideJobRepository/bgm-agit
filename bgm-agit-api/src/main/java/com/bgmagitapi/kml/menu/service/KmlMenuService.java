package com.bgmagitapi.kml.menu.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.kml.menu.dto.request.KmlMenuPostRequest;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuCreateOptionsResponse;
import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;

import java.util.List;

public interface KmlMenuService {

    List<KmlMenuGetResponse> findByKmlMenu();

    KmlMenuCreateOptionsResponse getMenuCreateOptions();

    ApiResponse createMenu(KmlMenuPostRequest request);

    ApiResponse updateMenu(Long menuId, KmlMenuPostRequest request);

    ApiResponse deleteMenu(Long menuId);
}
