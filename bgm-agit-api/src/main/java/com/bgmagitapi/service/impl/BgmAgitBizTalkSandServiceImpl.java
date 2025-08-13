package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.service.BgmAgitBizTalkSandService;
import com.bgmagitapi.service.BgmAgitBizTalkService;
import com.bgmagitapi.service.response.Attach;
import com.bgmagitapi.service.response.BizTalkResponse;
import com.bgmagitapi.service.response.BizTalkTokenResponse;
import com.bgmagitapi.util.AlimtalkUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;


@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitBizTalkSandServiceImpl implements BgmAgitBizTalkSandService {
    
    private final BgmAgitBizTalkService bgmAgitBizTalkService;
    
    @Value("${biztalk.sender-key}")
    private String senderKey;
    
    private final String bizTalkUrl = "https://www.biztalk-api.com";
    
    @Override
    public ApiResponse sandBizTalk(BgmAgitMember member, BgmAgitImage image, List<BgmAgitReservation> list) {
        DateTimeFormatter dateFmt = AlimtalkUtils.DATE_FMT; // 재사용 가능
        String formattedTimes = AlimtalkUtils.formatTimes(list);
        String formattedDate  = AlimtalkUtils.formatDate(list.get(0).getBgmAgitReservationStartDate());
        
        String message = AlimtalkUtils.buildReservationMessage(
                member.getBgmAgitMemberName(), formattedDate, formattedTimes);
        
        String ownerMessage = AlimtalkUtils.buildOwnerReservationMessage(
                member.getBgmAgitMemberName(), formattedDate, formattedTimes);
        
        String phone = AlimtalkUtils.formatRecipientKr(member.getBgmAgitMemberPhoneNo());
        
        Attach attach = AlimtalkUtils.defaultAttach();
        
        Map<String, Object> request = AlimtalkUtils.buildSendRequest(
                senderKey, phone, message, attach);
        
        Map<String, Object> request2 = AlimtalkUtils.buildOwnerSendRequest(
                senderKey, ownerMessage, attach
        );
        
        RestClient restClient = RestClient.create();
        BizTalkTokenResponse bizTalkToken = bgmAgitBizTalkService.getBizTalkToken();
        
        BizTalkResponse body = restClient.post()
                .uri(bizTalkUrl + "/v2/kko/sendAlimTalk")
                .header("Content-Type", "application/json")
                .header("bt-token", bizTalkToken.getToken())
                .body(request)
                .retrieve()
                .toEntity(BizTalkResponse.class)
                .getBody();
        
        BizTalkResponse body2 = restClient.post()
                .uri(bizTalkUrl + "/v2/kko/sendAlimTalk")
                .header("Content-Type", "application/json")
                .header("bt-token", bizTalkToken.getToken())
                .body(request2)
                .retrieve()
                .toEntity(BizTalkResponse.class)
                .getBody();
        
        
        return new ApiResponse(200, true, "성공");
    }
    
}
