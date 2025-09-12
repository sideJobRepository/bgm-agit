package com.bgmagitapi.service;

import com.bgmagitapi.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.controller.response.BgmAgitMainMenuResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface BgmAgitMainMenuService {
    
    List<BgmAgitMainMenuResponse> getMainMenu();
    
    Map<Long, List<BgmAgitMainMenuImageResponse>> getMainMenuImage(Long labelGb , String link);
    
    Map<String, Object> getImagePage(Long labelGb , String link, Pageable pageable, String category , String name);
}
