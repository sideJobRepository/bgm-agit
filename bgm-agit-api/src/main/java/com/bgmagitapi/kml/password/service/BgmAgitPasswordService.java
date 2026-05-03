package com.bgmagitapi.kml.password.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.kml.password.dto.request.BgmAgitPasswordRequest;

public interface BgmAgitPasswordService {

    /**
     * 점수 입력 비밀번호 검증.
     * - DB에 저장된 비밀번호가 없으면 통과 (초기 상태)
     * - 저장된 비밀번호가 있는데 일치하지 않으면 ValidException
     */
    void verify(String rawPassword);

    ApiResponse changePassword(BgmAgitPasswordRequest request);
}
