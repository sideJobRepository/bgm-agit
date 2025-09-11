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
import com.bgmagitapi.service.response.ReservationTalkContext;
import com.bgmagitapi.util.AlimtalkUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
        
        Attach attach = AlimtalkUtils.defaultAttach("예약 내역 확인 하기");
        
        Map<String, Object> request = AlimtalkUtils.buildSendRequest(
                senderKey, phone, message,"bgmagit-reservation-2",attach);
        
        Map<String, Object> request2 = AlimtalkUtils.buildOwnerSendRequest(
                senderKey, ownerMessage,"bgmagit-reservation-2",attach
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
    
    @Override
    public ApiResponse sendCancelBizTalk(ReservationTalkContext ctx) {
        validateCtx(ctx);
        var list = ctx.getReservations();
        String times = AlimtalkUtils.formatTimes(list);
        String date  = AlimtalkUtils.formatDate(list.get(0).getBgmAgitReservationStartDate());
        
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(ctx.getRole());
        String message  = isAdmin
                ? AlimtalkUtils.buildReservationCancelMessageAdmin(ctx.getMemberName(), date, times, ctx.getLabel())
                : AlimtalkUtils.buildReservationCancelMessage(ctx.getMemberName(), date, times, ctx.getLabel());
        String template = isAdmin ? "bgmagit-reservation-cancel-2" : "bgmagit-reservation-cancel";
        Long subjectId  = list.get(0).getBgmAgitReservationNo();
        
        return sendTalk(message, template, ctx.getPhone(), subjectId, "수정 되었습니다.",BgmAgitSubject.RESERVATION,"예약 내역 확인 하기");
    }
    
    @Override
    public ApiResponse sendCompleteBizTalk(ReservationTalkContext ctx) {
        validateCtx(ctx);
        var list = ctx.getReservations();
        String times = AlimtalkUtils.formatTimes(list);
        String date  = AlimtalkUtils.formatDate(list.get(0).getBgmAgitReservationStartDate());
        
        String message  = AlimtalkUtils.buildReservationCompleteMessage(ctx.getMemberName(), date, times, ctx.getLabel());
        String template = "bgmagit-reservation-complete";
        Long subjectId  = list.get(0).getBgmAgitReservationNo();
        
        return sendTalk(message, template, ctx.getPhone(), subjectId, "알림톡 발송 완료",BgmAgitSubject.RESERVATION,"예약 내역 확인 하기");
    }
    
    @Override
    public ApiResponse sendJoinMemberBizTalk(BgmAgitMember member) {
        String template = "bgmagit-member";
        String memberJoinDate = DateTimeFormatter.ofPattern("yyyy-MM-dd").format(member.getRegistDate());
        String memberJoinTime = DateTimeFormatter.ofPattern("HH:mm").format(member.getRegistDate());
        String memberName = member.getBgmAgitMemberName();
        String message = AlimtalkUtils.memberJoinMessage(memberName, memberJoinDate, memberJoinTime);
        String adminPhoneNo = "010-5059-3499";
        ApiResponse apiResponse = sendTalk(message, template, adminPhoneNo, null, "알림톡 발송 완료",BgmAgitSubject.SIGN_UP,"확인 하기");
        return apiResponse;
    }
    
    /** 공통 전송 + 히스토리 저장 */
    private ApiResponse sendTalk(String message, String templateName, String rawPhone,
                                 Long subjectId, String okMsg,BgmAgitSubject bgmAgitSubject,String buttonName) {
        
        String phone = AlimtalkUtils.formatRecipientKr(rawPhone);
        Attach attach = AlimtalkUtils.defaultAttach(buttonName);
        
        RestClient rest = RestClient.create();
        BizTalkTokenResponse token = bgmAgitBizTalkService.getBizTalkToken();
        
        Map<String, Object> req = AlimtalkUtils.buildSendRequest(
                senderKey, phone, message, templateName, attach
        );
        
        // 발송
        rest.post()
                .uri(bizTalkUrl + "/v2/kko/sendAlimTalk")
                .header("Content-Type", "application/json")
                .header("bt-token", token.getToken())
                .body(req)
                .retrieve()
                .toEntity(Void.class);
        
        // 결과 조회
        BizTalkResponse res = rest.get()
                .uri(bizTalkUrl + "/v2/kko/getResultAll")
                .header("Content-Type", "application/json")
                .header("bt-token", token.getToken())
                .retrieve()
                .toEntity(BizTalkResponse.class)
                .getBody();
        
        String msgIdx = Objects.toString(req.get("msgIdx"), null);
        
        Map<String, String> codeByIdx = Optional.ofNullable(res)
                .map(BizTalkResponse::getResponse)
                .orElseGet(List::of)
                .stream()
                .filter(Objects::nonNull)
                .filter(it -> it.getMsgIdx() != null)
                .collect(Collectors.toMap(
                        BizTalkResponse.Item::getMsgIdx,
                        BizTalkResponse.Item::getResultCode,
                        (a,b)->a
                ));
        
        String resultCode = codeByIdx.getOrDefault(msgIdx, "PENDING");
        
        BgmAgitBiztalkSendHistory history = new BgmAgitBiztalkSendHistory(
                bgmAgitSubject, subjectId, message, msgIdx
        );
        history.settingResultCode(resultCode);
        bgmAgitBiztalkSendHistoryRepository.save(history);
        
        return new ApiResponse(200, true, okMsg);
    }
    
    /** NPE/빈 리스트 방지 */
    private void validateCtx(ReservationTalkContext ctx) {
        if (ctx == null || ctx.getReservations() == null || ctx.getReservations().isEmpty()) {
            throw new IllegalArgumentException("전송 대상이 없습니다.");
        }
    }
}
