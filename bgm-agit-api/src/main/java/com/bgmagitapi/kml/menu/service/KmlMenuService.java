package com.bgmagitapi.kml.menu.service;

import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;

import java.util.List;

public interface KmlMenuService {

    
    List<KmlMenuGetResponse> findByKmlMenu();
}
