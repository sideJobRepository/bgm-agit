package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;

import java.util.List;

public interface BgmAgitBizTalkSandService {
    ApiResponse sandBizTalk(BgmAgitMember member, BgmAgitImage image, List<BgmAgitReservation> list);
}
