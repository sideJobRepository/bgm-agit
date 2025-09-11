package com.bgmagitapi.service;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.service.response.ReservationTalkContext;

import java.util.List;

public interface BgmAgitBizTalkSandService {
    ApiResponse sandBizTalk(BgmAgitMember member, BgmAgitImage image, List<BgmAgitReservation> list);
    ApiResponse sendCancelBizTalk(ReservationTalkContext ctx);
    ApiResponse sendCompleteBizTalk(ReservationTalkContext ctx);
    ApiResponse sendJoinMemberBizTalk(BgmAgitMember member);
}
