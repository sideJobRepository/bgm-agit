package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitBiztalkSendHistory;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.entity.enumeration.BgmAgitSubject;
import com.bgmagitapi.repository.BgmAgitBiztalkSendHistoryRepository;
import com.bgmagitapi.repository.BgmAgitImageRepository;
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

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitBizTalkSandServiceImpl implements BgmAgitBizTalkSandService {
    
    private final BgmAgitBizTalkService bgmAgitBizTalkService;
    
    private final BgmAgitBiztalkSendHistoryRepository bgmAgitBiztalkSendHistoryRepository;
    
    private final BgmAgitImageRepository bgmAgitImageRepository;
    
    @Value("${biztalk.sender-key}")
    private String senderKey;
    
    private final String bizTalkUrl = "https://www.biztalk-api.com";
    
    @Override
    public ApiResponse sandBizTalk(BgmAgitMember member, BgmAgitImage image, List<BgmAgitReservation> list) {
        String formattedTimes = AlimtalkUtils.formatTimes(list);
        String formattedDate = AlimtalkUtils.formatDate(list.get(0).getBgmAgitReservationStartDate());
        BgmAgitReservation bgmAgitReservation = list.get(0);
        
        BgmAgitImage agitImage = bgmAgitImageRepository.findById(image.getBgmAgitImageId()).orElseThrow(() -> new IllegalArgumentException("존재 하지 않는 룸 입니다."));
        String roomName = agitImage.getBgmAgitImageLabel();
        String message = AlimtalkUtils.buildReservationMessage(
                member.getBgmAgitMemberName(), formattedDate, formattedTimes,roomName);
        
        String ownerMessage = AlimtalkUtils.buildOwnerReservationMessage(
                member.getBgmAgitMemberName(), formattedDate, formattedTimes,roomName);
        
        String phone = AlimtalkUtils.formatRecipientKr(member.getBgmAgitMemberPhoneNo());
        
      //  Attach attach = AlimtalkUtils.defaultAttach();
        
        Map<String, Object> request = AlimtalkUtils.buildSendRequest(
                senderKey, phone, message,"bgmagit-reservation",null);
        
        Map<String, Object> request2 = AlimtalkUtils.buildOwnerSendRequest(
                senderKey, ownerMessage,"bgmagit-reservation",null
        );
        
        RestClient restClient = RestClient.create();
        BizTalkTokenResponse bizTalkToken = bgmAgitBizTalkService.getBizTalkToken();
        
    restClient.post()
                .uri(bizTalkUrl + "/v2/kko/sendAlimTalk")
                .header("Content-Type", "application/json")
                .header("bt-token", bizTalkToken.getToken())
                .body(request)
                .retrieve()
                .toEntity(BizTalkResponse.class)
                .getBody();
        
        restClient.post()
                .uri(bizTalkUrl + "/v2/kko/sendAlimTalk")
                .header("Content-Type", "application/json")
                .header("bt-token", bizTalkToken.getToken())
                .body(request2)
                .retrieve()
                .toEntity(BizTalkResponse.class)
                .getBody();
        
        BizTalkResponse result = restClient.get()
                .uri(bizTalkUrl + "/v2/kko/getResultAll")
                .header("Content-Type", "application/json")
                .header("bt-token", bizTalkToken.getToken())
                .retrieve()
                .toEntity(BizTalkResponse.class)
                .getBody();
        
        
        String msgIdx1 = Objects.toString(request.get("msgIdx"), null);
        String msgIdx2 = Objects.toString(request2.get("msgIdx"), null);

        // 히스토리 생성 (현재 생성자: (subject, subjectId, message, msgIdx))
        BgmAgitBiztalkSendHistory sendHistory1 = new BgmAgitBiztalkSendHistory(
                BgmAgitSubject.RESERVATION,
                bgmAgitReservation.getBgmAgitReservationNo(),
                message,
                msgIdx1
        );
        
        BgmAgitBiztalkSendHistory sendHistory2 = new BgmAgitBiztalkSendHistory(
                BgmAgitSubject.RESERVATION,
                bgmAgitReservation.getBgmAgitReservationNo(),
                ownerMessage,
                msgIdx2
        );
        
        List<BgmAgitBiztalkSendHistory> histories = List.of(sendHistory1, sendHistory2);

        // 결과 리스트 → msgIdx 별 resultCode 매핑
        Map<String, String> resultCodeByMsgIdx =
                Optional.ofNullable(result)
                        .map(BizTalkResponse::getResponse)
                        .orElseGet(List::of)
                        .stream()
                        .filter(Objects::nonNull)
                        .filter(it -> it.getMsgIdx() != null)
                        .collect(Collectors.toMap(
                                BizTalkResponse.Item::getMsgIdx,
                                BizTalkResponse.Item::getResultCode,
                                (a, b) -> a
                        ));


        for (BgmAgitBiztalkSendHistory h : histories) {
            String code = resultCodeByMsgIdx.get(h.getBgmAgitBiztalkSendHistoryMsgIdx());
            h.settingResultCode(code != null ? code : "PENDING");
        }


        bgmAgitBiztalkSendHistoryRepository.saveAll(histories);
        return new ApiResponse(200, true, "성공");
    }
    
}
