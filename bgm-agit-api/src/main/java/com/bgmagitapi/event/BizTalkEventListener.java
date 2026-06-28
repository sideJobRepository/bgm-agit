package com.bgmagitapi.event;


import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.event.dto.GatheringCancelledEvent;
import com.bgmagitapi.event.dto.GatheringConfirmedEvent;
import com.bgmagitapi.event.dto.InquiryEvent;
import com.bgmagitapi.event.dto.MatchRecordRegisteredEvent;
import com.bgmagitapi.event.dto.MemberJoinedEvent;
import com.bgmagitapi.event.dto.ReservationTalkEvent;
import com.bgmagitapi.event.dto.ReservationWaitingEvent;
import com.bgmagitapi.kml.lecture.dto.event.LecturePostEvent;
import com.bgmagitapi.kml.my.dto.events.MyAcademyApprovalEvent;
import com.bgmagitapi.kml.my.dto.events.MyAcademyCancelEvent;
import com.bgmagitapi.kml.review.dto.events.ReviewPostEvents;
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
    
    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onLecturePost(LecturePostEvent e) {
        try {
            bgmAgitBizTalkSandService.sendLecturePost(e);
        } catch (Exception ex) {
            bgmAgitBizTalkSandService.sendLecturePost(e);
        }
    }
    
    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMyAcademyApprovalEvent(MyAcademyApprovalEvent e) {
        try {
            bgmAgitBizTalkSandService.sendLecturePostComplete(e);
        } catch (Exception ex) {
            bgmAgitBizTalkSandService.sendLecturePostComplete(e);
        }
    }
    
    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMyAcademyCancelEvent(MyAcademyCancelEvent e) {
        try {
            if (e.getIsAdmin()) {
                bgmAgitBizTalkSandService.sendLectureCancel2(e);
            } else {
                bgmAgitBizTalkSandService.sendLectureCancel1(e);
            }
        } catch (Exception ex) {
            if (e.getIsAdmin()) {
                bgmAgitBizTalkSandService.sendLectureCancel2(e);
            } else {
                bgmAgitBizTalkSandService.sendLectureCancel1(e);
            }
        }
    }
    
    @Async("bizTalkExecutor")
      @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
      public void onReviewEvent(ReviewPostEvents e) {
          try {
              bgmAgitBizTalkSandService.sendReview(e);
          } catch (Exception ex) {
              bgmAgitBizTalkSandService.sendReview(e);
          }
      }

    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMatchRecordRegistered(MatchRecordRegisteredEvent e) {
        try {
            bgmAgitBizTalkSandService.sendMatchRecord(e.getMatchsId());
        } catch (Exception ex) {
            bgmAgitBizTalkSandService.sendMatchRecord(e.getMatchsId());
        }
    }

    // =========================== 모임 알림 (성사/취소) ===========================

    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onGatheringConfirmed(GatheringConfirmedEvent e) {
        try {
            bgmAgitBizTalkSandService.sendGatheringConfirmed(e.getGatheringId());
        } catch (Exception ex) {
            bgmAgitBizTalkSandService.sendGatheringConfirmed(e.getGatheringId());
        }
    }

    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onGatheringCancelled(GatheringCancelledEvent e) {
        try {
            bgmAgitBizTalkSandService.sendGatheringCancelled(e.getGatheringId());
        } catch (Exception ex) {
            bgmAgitBizTalkSandService.sendGatheringCancelled(e.getGatheringId());
        }
    }
}
