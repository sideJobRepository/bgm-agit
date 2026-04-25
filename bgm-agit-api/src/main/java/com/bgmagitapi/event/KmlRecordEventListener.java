package com.bgmagitapi.event;

import com.bgmagitapi.event.dto.KmlRecordSubmitEvent;
import com.bgmagitapi.security.service.kml.KmlRecordClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class KmlRecordEventListener {

    private final KmlRecordClient kmlRecordClient;

    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onRecordSubmit(KmlRecordSubmitEvent event) {
        try {
            kmlRecordClient.submit(event);
        } catch (Exception e) {
            log.warn("[KML] record_submit 리스너 처리 실패 cause={}", e.toString());
        }
    }
}
