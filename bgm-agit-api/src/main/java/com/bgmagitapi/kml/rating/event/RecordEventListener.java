package com.bgmagitapi.kml.rating.event;

import com.bgmagitapi.kml.rating.service.RatingService;
import com.bgmagitapi.origin.event.dto.MatchRecordRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class RecordEventListener {

    private final RatingService ratingService;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onMatchRecordRegistered(MatchRecordRegisteredEvent e) {
        ratingService.process(e.getMatchsId());
    }

}
