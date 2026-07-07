package com.bgmagitapi.origin.event;

import com.bgmagitapi.origin.event.dto.KmlRecordModifyEvent;
import com.bgmagitapi.origin.event.dto.KmlRecordSubmitEvent;
import com.bgmagitapi.origin.security.service.kml.KmlMatchsLinker;
import com.bgmagitapi.origin.security.service.kml.KmlRecordClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class KmlRecordEventListener {

    private final KmlRecordClient kmlRecordClient;
    private final KmlMatchsLinker kmlMatchsLinker;

    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onRecordSubmit(KmlRecordSubmitEvent event) {
        try {
            Optional<Long> kmlRecordId = kmlRecordClient.submit(event);
            kmlRecordId.ifPresent(id -> kmlMatchsLinker.linkKmlMatchsId(event.getMatchsId(), id));
        } catch (Exception e) {
            log.warn("[KML] record_submit 리스너 처리 실패 cause={}", e.toString());
        }
    }

    @Async("bizTalkExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onRecordModify(KmlRecordModifyEvent event) {
        try {
            kmlRecordClient.modify(event);
        } catch (Exception e) {
            log.warn("[KML] record_modify 리스너 처리 실패 cause={}", e.toString());
        }
    }
}
