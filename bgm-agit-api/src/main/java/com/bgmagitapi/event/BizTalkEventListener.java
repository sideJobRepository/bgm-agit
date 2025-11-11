package com.bgmagitapi.event;


import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.event.dto.InquiryEvent;
import com.bgmagitapi.event.dto.MemberJoinedEvent;
import com.bgmagitapi.event.dto.ReservationTalkEvent;
import com.bgmagitapi.event.dto.ReservationWaitingEvent;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitBizTalkSandService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BizTalkEventListener {
    
    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final BgmAgitBizTalkSandService bgmAgitBizTalkSandService;
    
    @Async(value = "bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMemberJoin(MemberJoinedEvent memberJoinedEvent) {
        
        BgmAgitMember member = bgmAgitMemberRepository.findById(memberJoinedEvent.getMemberId())
                .orElse(null);
        if (member == null) return;
        try {
            bgmAgitBizTalkSandService.sendJoinMemberBizTalk(member);
        } catch (Exception e) {
            bgmAgitBizTalkSandService.sendJoinMemberBizTalk(member); // 일단 실패시 다시한번 보내는걸로..
        }
    }
    
    /**
     * 예약완료 (대기상태)
     */
    @Async(value = "bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void ReservationWaitingEvent(ReservationWaitingEvent reservationWaiting) {
        BgmAgitMember bgmAgitMember = reservationWaiting.getBgmAgitMember();
        BgmAgitImage bgmAgitImage = reservationWaiting.getBgmAgitImage();
        List<BgmAgitReservation> list = reservationWaiting.getList();
        if (bgmAgitMember == null) return;
        try {
            bgmAgitBizTalkSandService.sandBizTalk(bgmAgitMember, bgmAgitImage, list);
        } catch (Exception e) {
            bgmAgitBizTalkSandService.sandBizTalk(bgmAgitMember, bgmAgitImage, list);
        }
    }
    
    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReservationTalk(ReservationTalkEvent e) {
        try {
            switch (e.getAction()) {
                case COMPLETE -> bgmAgitBizTalkSandService.sendCompleteBizTalk(e.getReservationTalkContext());
                case CANCEL -> bgmAgitBizTalkSandService.sendCancelBizTalk(e.getReservationTalkContext());
                default -> {
                }
            }
        } catch (Exception ex) {
            switch (e.getAction()) {
                case COMPLETE -> bgmAgitBizTalkSandService.sendCompleteBizTalk(e.getReservationTalkContext());
                case CANCEL -> bgmAgitBizTalkSandService.sendCancelBizTalk(e.getReservationTalkContext());
                default -> {
                }
            }
        }
    }
    
    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReservationTalk(InquiryEvent e) {
        try {
            switch (e.getTalkAction()) {
                case NONE -> bgmAgitBizTalkSandService.sendInquiry(e);
                case COMPLETE -> bgmAgitBizTalkSandService.sendInquiryComplete(e);
                default -> {
                }
            }
            
        } catch (Exception ex) {
            switch (e.getTalkAction()) {
                case NONE -> bgmAgitBizTalkSandService.sendInquiry(e);
                case COMPLETE -> bgmAgitBizTalkSandService.sendInquiryComplete(e);
                default -> {
                }
            }
        }
    }
}
