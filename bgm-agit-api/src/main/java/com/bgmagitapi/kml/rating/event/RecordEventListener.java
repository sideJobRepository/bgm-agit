package com.bgmagitapi.kml.rating.event;

import com.bgmagitapi.kml.rating.service.RatingService;
import com.bgmagitapi.origin.event.dto.MatchRecordRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class RecordEventListener {

    private final RatingService ratingService;

    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMatchRecordRegistered(MatchRecordRegisteredEvent e) {
        e.getMatchsId();
        // TODO: Match 정보 가져와서 rating 계산
    }

}
