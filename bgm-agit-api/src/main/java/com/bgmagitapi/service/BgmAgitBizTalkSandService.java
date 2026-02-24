package com.bgmagitapi.service;

import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.event.dto.InquiryEvent;
import com.bgmagitapi.kml.lecture.dto.event.LecturePostEvent;
import com.bgmagitapi.kml.my.dto.events.MyAcademyApprovalEvent;
import com.bgmagitapi.service.response.ReservationTalkContext;

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
}
