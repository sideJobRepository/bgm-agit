package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.entity.BgmAgitImage;
import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.event.dto.InquiryEvent;
import com.bgmagitapi.origin.lecture.dto.event.LecturePostEvent;
import com.bgmagitapi.origin.my.dto.events.MyAcademyApprovalEvent;
import com.bgmagitapi.origin.my.dto.events.MyAcademyCancelEvent;
import com.bgmagitapi.kml.review.dto.events.ReviewPostEvents;
import com.bgmagitapi.origin.service.response.ReservationTalkContext;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitBizTalkSandService {
    void sandBizTalk(BgmAgitMember member, BgmAgitImage image, List<BgmAgitReservation> list);
    void sendCancelBizTalk(ReservationTalkContext ctx);
    void sendCompleteBizTalk(ReservationTalkContext ctx);
    void sendJoinMemberBizTalk(BgmAgitMember member);
    void sendInquiry(InquiryEvent event);
    void sendInquiryComplete(InquiryEvent event);
    
    void sendLecturePost(LecturePostEvent e);
    void sendLecturePostComplete(MyAcademyApprovalEvent event);
    void sendLectureCancel1(MyAcademyCancelEvent event);
    void sendLectureCancel2(MyAcademyCancelEvent event);
    void sendReview(ReviewPostEvents e);
    void sendMatchRecord(Long matchsId);

    /** 관리자에게 해당 일자 예약 현황 발송. 예약이 0건이어도 "없음"으로 채워 매일 보낸다. */
    void sendAdminDailyReservation(LocalDate date);
}
