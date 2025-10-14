package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitBiztalkSendHistory;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

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
        validateList(list);
        
        BgmAgitReservation bgmAgitReservation = list.get(0);
        String formattedTimes = AlimtalkUtils.formatTimes(list);
        String formattedDate = AlimtalkUtils.formatDate(bgmAgitReservation.getBgmAgitReservationStartDate());
        String people = String.valueOf(bgmAgitReservation.getBgmAgitReservationPeople());
        String reservationRequest = bgmAgitReservation.getBgmAgitReservationRequest();
        
        // 이미지 검증 및 룸/마작 구분
        BgmAgitImage agitImage = bgmAgitImageRepository.findById(image.getBgmAgitImageId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 룸입니다."));
        boolean isRoom = agitImage.getBgmAgitImageCategory() == BgmAgitImageCategory.ROOM;
        String roomName = agitImage.getBgmAgitImageLabel();
        
        // 메시지 구성
        String message = AlimtalkUtils.buildReservationMessage(
                member.getBgmAgitMemberName(), formattedDate, formattedTimes, roomName, people, reservationRequest
        );
        
        String ownerMessage = AlimtalkUtils.buildOwnerReservationMessage(
                member.getBgmAgitMemberName(), formattedDate, formattedTimes, roomName, people, reservationRequest
        );
        
        // 템플릿명 및 버튼명 정의
        String template = "bgmagit-res";
        String buttonName = "예약 내역 확인 하기";
        Long subjectId = bgmAgitReservation.getBgmAgitReservationNo();
        BgmAgitSubject subject = isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL;
        
        // 사용자에게 발송
        sendTalk(message, template, member.getBgmAgitMemberPhoneNo(), subjectId, "알림톡 발송 완료", subject, buttonName);
        
        // 관리자에게 발송
        sendTalk(ownerMessage, template, "010-5059-3499", subjectId, "알림톡 발송 완료", subject, buttonName);
        
        return new ApiResponse(200, true, "성공");
    }
    
    @Override
    public ApiResponse sendCancelBizTalk(ReservationTalkContext ctx) {
        validateCtx(ctx);
        List<BgmAgitReservation> list = ctx.getReservations();
        BgmAgitImage bgmAgitImage = ctx.getReservations().get(0).getBgmAgitImage();
        boolean isRoom = bgmAgitImage.getBgmAgitImageCategory() == BgmAgitImageCategory.ROOM;
        String times = AlimtalkUtils.formatTimes(list);
        String date  = AlimtalkUtils.formatDate(list.get(0).getBgmAgitReservationStartDate());
        String bgmAgitReservationPeople = String.valueOf(list.get(0).getBgmAgitReservationPeople());
        String bgmAgitReservationRequest = list.get(0).getBgmAgitReservationRequest();
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(ctx.getRole());
        String message  = isAdmin
                ? AlimtalkUtils.reservationCancelMessage2(ctx.getMemberName(), date, times, ctx.getLabel())
                : AlimtalkUtils.reservationCancelMessage1(ctx.getMemberName(), date, times, ctx.getLabel(),bgmAgitReservationPeople,bgmAgitReservationRequest);
        String template = isAdmin ? "bgmagit-reservation-cancel-2" : "bgmagit-res-cancel";
        Long subjectId  = list.get(0).getBgmAgitReservationNo();
        
        ApiResponse apiResponse = sendTalk(message, template, ctx.getPhone(), subjectId, "수정 되었습니다.", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL , "예약 내역 확인 하기");
        
        if("bgmagit-res-cancel".equals(template)) {
            String cancelMessage3 = AlimtalkUtils.reservationCancelMessage3(ctx.getMemberName(),date, times, ctx.getLabel(),bgmAgitReservationPeople,bgmAgitReservationRequest);
            sendTalk(cancelMessage3,"bgmagit-res-cancel","010-5059-3499",subjectId,"수정 되었습니다.",isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL,"예약 내역 확인 하기");
        }
        return apiResponse;
        
    }
    
    @Override
    public ApiResponse sendCompleteBizTalk(ReservationTalkContext ctx) {
        validateCtx(ctx);
        List<BgmAgitReservation> list = ctx.getReservations();
        BgmAgitImage bgmAgitImage = ctx.getReservations().get(0).getBgmAgitImage();
        boolean isRoom = bgmAgitImage.getBgmAgitImageCategory() == BgmAgitImageCategory.ROOM;
        String times = AlimtalkUtils.formatTimes(list);
        String date  = AlimtalkUtils.formatDate(list.get(0).getBgmAgitReservationStartDate());
        BgmAgitReservation bgmAgitReservation = list.get(0);
        String people = String.valueOf( bgmAgitReservation.getBgmAgitReservationPeople());
        String request = bgmAgitReservation.getBgmAgitReservationRequest();
        String message1  = AlimtalkUtils.buildReservationCompleteMessage(ctx.getMemberName(), date, times, ctx.getLabel(),people,request);
        String message2  = AlimtalkUtils.buildReservationCompleteMessage("관리자", date, times, ctx.getLabel(),people,request);
        String template = "bgmagit-res-complete";
        Long subjectId  = list.get(0).getBgmAgitReservationNo();
        
               sendTalk(message1, template, ctx.getPhone(), subjectId, "알림톡 발송 완료", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL,"예약 내역 확인 하기");
        return sendTalk(message2, template, "010-5059-3499", subjectId, "알림톡 발송 완료", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL,"예약 내역 확인 하기");
    }
    
    @Override
    public ApiResponse sendJoinMemberBizTalk(BgmAgitMember member) {
        String template = "bgmagit-member";
        String memberJoinDate = DateTimeFormatter.ofPattern("yyyy-MM-dd").format(member.getRegistDate());
        String memberJoinTime = DateTimeFormatter.ofPattern("HH:mm").format(member.getRegistDate());
        String memberName = member.getBgmAgitMemberName();
        String message = AlimtalkUtils.memberJoinMessage(memberName, memberJoinDate, memberJoinTime);
        String adminPhoneNo = "010-5059-3499";
        return sendTalk(message, template, adminPhoneNo, null, "알림톡 발송 완료",BgmAgitSubject.SIGN_UP,"확인 하기");
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
    /** 리스트 유효성 검사 (null 또는 empty 방지) */
    private void validateList(List<BgmAgitReservation> list) {
        if (list == null || list.isEmpty()) {
            throw new IllegalArgumentException("예약 데이터가 없습니다.");
        }
    }
    
}
