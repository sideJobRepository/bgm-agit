package com.bgmagitapi.security.service.kml;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.event.dto.KmlRecordSubmitEvent;
import com.bgmagitapi.kml.matchs.entity.Matchs;
import com.bgmagitapi.kml.record.entity.Record;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 한 대국(Matchs)과 그 4명의 Record로 KML record_submit 페이로드(KmlRecordSubmitEvent)를 만든다.
 * 송신 가능 조건(정확히 4명 + 전원 KML 연동)을 한 곳에서 판단해 등록 흐름과 재전송 스케줄러가 공유한다.
 * - wind/seat ordinal = 0동 1남 2서 3북, point = recordScore, common_point = 0 (현재 추적 안 함)
 */
@Slf4j
@Component
public class KmlRecordSubmitEventFactory {

    public Optional<KmlRecordSubmitEvent> build(Matchs matchs, List<Record> records) {
        Long matchsId = matchs != null ? matchs.getId() : null;

        if (records == null || records.size() != 4) {
            log.info("[KML] record_submit 빌드 생략 — 참가자 수가 4명이 아님 matchsId={}, size={}",
                    matchsId, records == null ? 0 : records.size());
            return Optional.empty();
        }

        List<KmlRecordSubmitEvent.Player> players = new ArrayList<>();
        for (Record rec : records) {
            BgmAgitMember member = rec.getMember();
            Long kmlId = member != null ? member.getBgmAgitMemberKmlId() : null;
            if (kmlId == null) {
                log.info("[KML] record_submit 빌드 생략 — KML 미연동 회원 포함 matchsId={}, memberId={}",
                        matchsId, member != null ? member.getBgmAgitMemberId() : null);
                return Optional.empty();
            }
            players.add(new KmlRecordSubmitEvent.Player(
                    kmlId,
                    rec.getRecordScore(),
                    rec.getRecordSeat().ordinal()
            ));
        }

        return Optional.of(new KmlRecordSubmitEvent(
                matchsId,
                matchs.getWind().ordinal(),
                0,
                players
        ));
    }
}
