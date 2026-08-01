package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitMainMenuPostRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuCreateOptionsResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuImageResponse;
import com.bgmagitapi.origin.controller.response.BgmAgitMainMenuResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface BgmAgitMainMenuService {

    List<BgmAgitMainMenuResponse> getMainMenu();

    Map<Long, List<BgmAgitMainMenuImageResponse>> getMainMenuImage(Long labelGb , String link);

    Map<String, Object> getImagePage(Long labelGb , String link, Pageable pageable, String category , String name);

    // 관리자 메뉴 관리
    BgmAgitMainMenuCreateOptionsResponse getMenuCreateOptions();

    ApiResponse createMenu(BgmAgitMainMenuPostRequest request);

    ApiResponse updateMenu(Long menuId, BgmAgitMainMenuPostRequest request);

    ApiResponse deleteMenu(Long menuId);
}
