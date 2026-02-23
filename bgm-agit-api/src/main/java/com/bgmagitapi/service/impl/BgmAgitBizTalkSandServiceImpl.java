package com.bgmagitapi.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.entity.BgmAgitBiztalkSendHistory;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.entity.enumeration.BgmAgitSubject;
import com.bgmagitapi.event.dto.InquiryEvent;
import com.bgmagitapi.kml.lecture.dto.event.LecturePostEvent;
import com.bgmagitapi.repository.BgmAgitBiztalkSendHistoryRepository;
import com.bgmagitapi.repository.BgmAgitImageRepository;
import com.bgmagitapi.service.BgmAgitBizTalkSandService;
import com.bgmagitapi.service.BgmAgitBizTalkService;
import com.bgmagitapi.service.response.Attach;
import com.bgmagitapi.service.response.BizTalkResponse;
import com.bgmagitapi.service.response.BizTalkTokenResponse;
import com.bgmagitapi.service.response.ReservationTalkContext;
import com.bgmagitapi.util.AlimtalkTemplate;
import com.bgmagitapi.util.AlimtalkUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
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
    
    private static final String PHONE1 = "010-5059-3499";
    private static final String PHONE2 = "010-5592-8832";
    
    @Value("${biztalk.sender-key}")
    private String senderKey;
    
    private final String bizTalkUrl = "https://www.biztalk-api.com";
    
    @Override
    public ApiResponse sandBizTalk(BgmAgitMember member, BgmAgitImage image, List<BgmAgitReservation> list) {
        
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
        String template = AlimtalkTemplate.BGMAGIT_RES_ACCOUNT2;
        String buttonName = "예약 내역 확인 하기";
        Long subjectId = bgmAgitReservation.getBgmAgitReservationNo();
        BgmAgitSubject subject = isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL;
        
        // 사용자에게 발송
        sendTalk(message, template, member.getBgmAgitMemberPhoneNo(), subjectId, "알림톡 발송 완료", subject, buttonName,"https://bgmagit.co.kr");
        
        // 관리자에게 발송
        sendTalk(ownerMessage, template, PHONE1, subjectId, "알림톡 발송 완료", subject, buttonName,"https://bgmagit.co.kr");
        sendTalk(ownerMessage, template, PHONE2, subjectId, "알림톡 발송 완료", subject, buttonName,"https://bgmagit.co.kr");
        
        return new ApiResponse(200, true, "성공");
    }
    
    @Override
    public ApiResponse sendCancelBizTalk(ReservationTalkContext ctx) {
        List<BgmAgitReservation> list = ctx.getReservations();
        BgmAgitImage bgmAgitImage = ctx.getReservations().get(0).getBgmAgitImage();
        boolean isRoom = bgmAgitImage.getBgmAgitImageCategory() == BgmAgitImageCategory.ROOM;
        String times = AlimtalkUtils.formatTimes(list);
        String date = AlimtalkUtils.formatDate(list.get(0).getBgmAgitReservationStartDate());
        String bgmAgitReservationPeople = String.valueOf(list.get(0).getBgmAgitReservationPeople());
        String bgmAgitReservationRequest = list.get(0).getBgmAgitReservationRequest();
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(ctx.getRole());
        String message = isAdmin
                ? AlimtalkUtils.reservationCancelMessage2(ctx.getMemberName(), date, times, ctx.getLabel())
                : AlimtalkUtils.reservationCancelMessage1(ctx.getMemberName(), date, times, ctx.getLabel(), bgmAgitReservationPeople, bgmAgitReservationRequest);
        String template = isAdmin ? "bgmagit-reservation-cancel-2" : "bgmagit-res-cancel";
        Long subjectId = list.get(0).getBgmAgitReservationNo();
        
        ApiResponse apiResponse = sendTalk(message, template, ctx.getPhone(), subjectId, "수정 되었습니다.", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL, "예약 내역 확인 하기","https://bgmagit.co.kr");
        
        if ("bgmagit-res-cancel".equals(template)) {
            String cancelMessage3 = AlimtalkUtils.reservationCancelMessage3(ctx.getMemberName(), date, times, ctx.getLabel(), bgmAgitReservationPeople, bgmAgitReservationRequest);
            sendTalk(cancelMessage3, "bgmagit-res-cancel", PHONE1, subjectId, "수정 되었습니다.", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL, "예약 내역 확인 하기","https://bgmagit.co.kr");
            sendTalk(cancelMessage3, "bgmagit-res-cancel", PHONE2, subjectId, "수정 되었습니다.", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL, "예약 내역 확인 하기","https://bgmagit.co.kr");
        }
        return apiResponse;
        
    }
    
    @Override
    public ApiResponse sendCompleteBizTalk(ReservationTalkContext ctx) {
        List<BgmAgitReservation> list = ctx.getReservations();
        BgmAgitImage bgmAgitImage = ctx.getReservations().get(0).getBgmAgitImage();
        boolean isRoom = bgmAgitImage.getBgmAgitImageCategory() == BgmAgitImageCategory.ROOM;
        String times = AlimtalkUtils.formatTimes(list);
        String date = AlimtalkUtils.formatDate(list.get(0).getBgmAgitReservationStartDate());
        BgmAgitReservation bgmAgitReservation = list.get(0);
        String people = String.valueOf(bgmAgitReservation.getBgmAgitReservationPeople());
        String request = bgmAgitReservation.getBgmAgitReservationRequest();
        String message1 = AlimtalkUtils.buildReservationCompleteMessage(ctx.getMemberName(), date, times, ctx.getLabel(), people, request);
        String message2 = AlimtalkUtils.buildReservationCompleteMessage("관리자", date, times, ctx.getLabel(), people, request);
        String template = "bgmagit-res-complete";
        Long subjectId = list.get(0).getBgmAgitReservationNo();
        
        sendTalk(message1, template, ctx.getPhone(), subjectId, "알림톡 발송 완료", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL, "예약 내역 확인 하기","https://bgmagit.co.kr");
        sendTalk(message2, template, PHONE1, subjectId, "알림톡 발송 완료", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL, "예약 내역 확인 하기","https://bgmagit.co.kr");
        return sendTalk(message2, template, PHONE2, subjectId, "알림톡 발송 완료", isRoom ? BgmAgitSubject.RESERVATION : BgmAgitSubject.MAHJONG_RENTAL, "예약 내역 확인 하기","https://bgmagit.co.kr");
    }
    
    @Override
    public ApiResponse sendJoinMemberBizTalk(BgmAgitMember member) {
        String template = "bgmagit-member";
        String memberJoinDate = DateTimeFormatter.ofPattern("yyyy-MM-dd").format(member.getRegistDate());
        String memberJoinTime = DateTimeFormatter.ofPattern("HH:mm").format(member.getRegistDate());
        String memberName = member.getBgmAgitMemberName();
        String message = AlimtalkUtils.memberJoinMessage(memberName, memberJoinDate, memberJoinTime);
        sendTalk(message, template, PHONE1, null, "알림톡 발송 완료", BgmAgitSubject.SIGN_UP, "확인 하기","https://bgmagit.co.kr");
        return sendTalk(message, template, PHONE2, null, "알림톡 발송 완료", BgmAgitSubject.SIGN_UP, "확인 하기","https://bgmagit.co.kr");
    }
    
    @Override
    public ApiResponse sendInquiry(InquiryEvent event) {
        String template = "bgmagit-inquiry";
        Long id = event.getId();
        String memberName = event.getMemberName();
        String title = event.getTitle();
        String inquiryDate = DateTimeFormatter.ofPattern("yyyy-MM-dd").format(event.getRegistDate());
        String inquiryTime = DateTimeFormatter.ofPattern("HH:mm").format(event.getRegistDate());
        String message = AlimtalkUtils.oneToOneInquiry(memberName, title, inquiryDate, inquiryTime);
        sendTalk(message, template, PHONE1, id, "알림톡 발송 완료", BgmAgitSubject.INQUIRY, "사이트 바로가기","https://bgmagit.co.kr");
        return sendTalk(message, template, PHONE2, id, "알림톡 발송 완료", BgmAgitSubject.INQUIRY, "사이트 바로가기","https://bgmagit.co.kr");
    }
    
    @Override
    public ApiResponse sendInquiryComplete(InquiryEvent event) {
        String template = "bgmagit-inquiry-ans";
        Long id = event.getId();
        String memberName = event.getMemberName();
        String memberPhoneNo = event.getMemberPhoneNo();
        String message = AlimtalkUtils.oneToOneInquiryAns(memberName);
        return sendTalk(message, template, memberPhoneNo, id, "알림톡 발송 완료", BgmAgitSubject.INQUIRY, "사이트 바로가기","https://bgmagit.co.kr");
    }
    
    @Override
    public void sendLecturePost(LecturePostEvent event) {
        String template = AlimtalkTemplate.BGMAGIT_RES_LECTURE;
        Long id = event.getId();
        String memberName = event.getMemberName();
        String memberPhoneNo = event.getPhoneNo();
        String date =DateTimeFormatter.ofPattern("yyyy-MM-dd").format(event.getDate());
        String time = event.getTime();
        String message = AlimtalkUtils.buildLectureMessage(memberName,date,time);
        sendTalk(message, template, PHONE1, id, "알림톡 발송 완료", event.getSubject(), "예약 내역 확인 하기","https://bgmagit.co.kr/record");
        sendTalk(message, template, PHONE2, id, "알림톡 발송 완료", event.getSubject(), "예약 내역 확인 하기","https://bgmagit.co.kr/record");
        sendTalk(message, template, memberPhoneNo, id, "알림톡 발송 완료", event.getSubject(), "예약 내역 확인 하기","https://bgmagit.co.kr/record");
    }
    
    /**
     * 공통 전송 + 히스토리 저장
     */
    private ApiResponse sendTalk(String message, String templateName, String rawPhone,
                                 Long subjectId, String okMsg, BgmAgitSubject bgmAgitSubject, String buttonName,String url) {
        
        String phone = AlimtalkUtils.formatRecipientKr(rawPhone);
        Attach attach = AlimtalkUtils.defaultAttach(buttonName,url);
        
        RestClient rest = RestClient.create();
        BizTalkTokenResponse token = bgmAgitBizTalkService.getBizTalkToken();
        
        Map<String, Object> req = AlimtalkUtils.buildSendRequest(senderKey, phone, message, templateName, attach);
        
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
                        (a, b) -> a
                ));
        
        String resultCode = codeByIdx.getOrDefault(msgIdx, "PENDING");
        bgmAgitBiztalkSendHistoryRepository.save(new BgmAgitBiztalkSendHistory(bgmAgitSubject, subjectId, message, msgIdx,resultCode));
        
        return new ApiResponse(200, true, okMsg);
    }
}
