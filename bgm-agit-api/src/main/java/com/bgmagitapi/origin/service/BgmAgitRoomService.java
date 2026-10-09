package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitRoomCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitRoomModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitRoomResponse;

import java.util.List;

public interface BgmAgitRoomService {

    /**
     * includeHidden 은 관리자(roles)일 때만 반영한다. 비관리자가 넘기면 숨김 제외 목록을 돌려준다.
     */
    List<BgmAgitRoomResponse> getRooms(String link, boolean includeHidden, List<String> roles);

    ApiResponse createRoom(BgmAgitRoomCreateRequest request);

    ApiResponse modifyRoom(BgmAgitRoomModifyRequest request);

    ApiResponse deleteRoom(Long roomId);
}
