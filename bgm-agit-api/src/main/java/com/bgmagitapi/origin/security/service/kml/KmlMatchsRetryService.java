package com.bgmagitapi.origin.security.service.kml;

import com.bgmagitapi.origin.event.dto.KmlRecordSubmitEvent;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.matchs.repository.MatchsRepository;
import com.bgmagitapi.kml.record.entity.Record;
import com.bgmagitapi.kml.record.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * KML 미연동(matchsKmlId IS NULL) 대국을 찾아 KML로 재전송한다.
 * - 신규 등록(api_record_submit)으로 보냄. null = KML에 record_id 없음이라 modify 불가.
 * - 송신 성공 시 KmlMatchsLinker로 matchsKmlId를 채운다 (linker가 자체 트랜잭션).
 * - 전체를 감싸는 트랜잭션을 두지 않는다 (HTTP 호출이 트랜잭션에 묶이지 않도록, 기존 리스너와 동일).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KmlMatchsRetryService {

    // 한 회차당 재전송 시도 상한 (잔여분은 다음 회차에 계속 처리)
    private static final int BATCH_LIMIT = 100;

    private final MatchsRepository matchsRepository;
    private final RecordRepository recordRepository;
    private final KmlRecordSubmitEventFactory kmlRecordSubmitEventFactory;
    private final KmlRecordClient kmlRecordClient;
    private final KmlMatchsLinker kmlMatchsLinker;

    public void retryAll() {
        List<Matchs> candidates = matchsRepository.findByMatchsKmlIdIsNull(BATCH_LIMIT);
        if (candidates.isEmpty()) {
            log.info("[KML-MATCHS-RETRY] 재전송 대상 없음");
            return;
        }
        log.info("[KML-MATCHS-RETRY] 재전송 대상 {}건", candidates.size());

        List<Long> ids = candidates.stream().map(Matchs::getId).toList();
        // member + matchs fetchJoin 으로 한 번에 조회 → 트랜잭션 없이도 lazy 접근 안전
        Map<Long, List<Record>> byMatch = recordRepository.findRecordsByMatchIds(ids).stream()
                .collect(Collectors.groupingBy(r -> r.getMatchs().getId()));

        int sent = 0;
        int skipped = 0;
        for (Matchs matchs : candidates) {
            List<Record> records = byMatch.getOrDefault(matchs.getId(), List.of());

            Optional<KmlRecordSubmitEvent> event = kmlRecordSubmitEventFactory.build(matchs, records);
            if (event.isEmpty()) {
                // 4명 미만 또는 KML 미연동 회원 포함 → 송신 불가 (factory가 사유 로그)
                skipped++;
                continue;
            }

            Optional<Long> kmlRecordId = kmlRecordClient.submit(event.get());
            if (kmlRecordId.isPresent()) {
                kmlMatchsLinker.linkKmlMatchsId(matchs.getId(), kmlRecordId.get());
                sent++;
            }
        }

        int failed = candidates.size() - sent - skipped;
        log.info("[KML-MATCHS-RETRY] 완료: 대상={}, 전송성공={}, 스킵={}, 전송실패={}",
                candidates.size(), sent, skipped, failed);
    }
}
