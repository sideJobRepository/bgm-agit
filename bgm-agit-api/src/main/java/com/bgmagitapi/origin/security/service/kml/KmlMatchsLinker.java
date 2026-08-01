package com.bgmagitapi.origin.security.service.kml;

import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class KmlMatchsLinker {

    private final MatchsRepository matchsRepository;

    /**
     * KML record_submit 응답으로 받은 record_id 를 BGM_AGIT_MATCHS 에 저장.
     * @Async 리스너에서 호출되므로 자체 트랜잭션을 연다.
     */
    @Transactional
    public void linkKmlMatchsId(Long matchsId, Long kmlRecordId) {
        if (matchsId == null || kmlRecordId == null) return;
        matchsRepository.findById(matchsId).ifPresentOrElse(
                m -> {
                    m.linkKmlMatchsId(kmlRecordId);
                    log.info("[KML] matchsKmlId 연결 matchsId={} -> kmlRecordId={}", matchsId, kmlRecordId);
                },
                () -> log.warn("[KML] matchsKmlId 연결 실패 — matchs 미존재 matchsId={}", matchsId)
        );
    }
}
