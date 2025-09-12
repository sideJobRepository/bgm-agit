package com.bgmagitapi.event;


import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import com.bgmagitapi.service.BgmAgitBizTalkSandService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

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
}
