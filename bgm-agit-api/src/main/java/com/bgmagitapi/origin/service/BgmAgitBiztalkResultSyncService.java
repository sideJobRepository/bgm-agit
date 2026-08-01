package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.entity.BgmAgitBiztalkSendHistory;
import com.bgmagitapi.origin.repository.BgmAgitBiztalkSendHistoryRepository;
import com.bgmagitapi.origin.service.response.BizTalkResponse;
import com.bgmagitapi.origin.service.response.BizTalkTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 비즈톡 발송 이력의 결과 코드 동기화.
 * <p>
 * 발송 직후엔 비즈톡 결과가 집계되지 않아 {@link BgmAgitBiztalkSendHistory} 가 PENDING 으로 저장된다.
 * getResultAll 은 호출 시 버퍼에 쌓인 결과를 반환하며 소비(비움)하므로, 발송 경로마다 호출하면
 * 다른 발송 건의 결과까지 날아간다. 그래서 결과 조회/소비는 이 서비스 한 곳에서만 수행하고,
 * 받아온 결과를 최근 PENDING 이력과 msgIdx 로 매칭해 일괄 갱신한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BgmAgitBiztalkResultSyncService {

    private final BgmAgitBizTalkService bgmAgitBizTalkService;
    private final BgmAgitBiztalkSendHistoryRepository bgmAgitBiztalkSendHistoryRepository;

    private final String bizTalkUrl = "https://www.biztalk-api.com";

    // 갱신 대상 윈도우 (이보다 오래된 PENDING 은 버퍼에 결과가 없으므로 제외)
    private static final long RECENT_HOURS = 24;
    // getResultAll 반복 호출 안전 상한 (버퍼가 한 번에 일부만 반환할 수 있어 빈 응답까지 반복)
    private static final int MAX_DRAIN_LOOP = 50;

    public void syncRecentResults() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(RECENT_HOURS);
        List<BgmAgitBiztalkSendHistory> pending =
                bgmAgitBiztalkSendHistoryRepository.findByBgmAgitBiztalkSendHistoryResultCodeAndRegistDateAfter("PENDING", cutoff);

        if (pending.isEmpty()) {
            return;
        }

        Map<String, String> codeByIdx = drainResults();
        if (codeByIdx.isEmpty()) {
            log.info("[BIZTALK-SYNC] PENDING {}건 / 비즈톡 결과 0건 - 대기", pending.size());
            return;
        }

        int updated = 0;
        for (BgmAgitBiztalkSendHistory history : pending) {
            String code = codeByIdx.get(history.getBgmAgitBiztalkSendHistoryMsgIdx());
            if (code != null) {
                history.updateResultCode(code);
                updated++;
            }
        }
        log.info("[BIZTALK-SYNC] PENDING {}건 / 결과 수신 {}건 / 갱신 {}건", pending.size(), codeByIdx.size(), updated);
    }

    /**
     * getResultAll 을 빈 응답이 나올 때까지 반복 호출해 버퍼를 비우고 msgIdx -> resultCode 맵으로 누적한다.
     * 호출이 결과를 소비하므로, 매칭되는 PENDING 이력이 없더라도 받아온 결과는 이 트랜잭션 안에서 한 번에 처리한다.
     */
    private Map<String, String> drainResults() {
        RestClient rest = RestClient.create();
        BizTalkTokenResponse token = bgmAgitBizTalkService.getBizTalkToken();

        Map<String, String> codeByIdx = new HashMap<>();
        for (int i = 0; i < MAX_DRAIN_LOOP; i++) {
            BizTalkResponse res = rest.get()
                    .uri(bizTalkUrl + "/v2/kko/getResultAll")
                    .header("Content-Type", "application/json")
                    .header("bt-token", token.getToken())
                    .retrieve()
                    .toEntity(BizTalkResponse.class)
                    .getBody();

            List<BizTalkResponse.Item> items = res == null ? null : res.getResponse();
            if (items == null || items.isEmpty()) {
                break;
            }
            for (BizTalkResponse.Item item : items) {
                if (item != null && item.getMsgIdx() != null) {
                    codeByIdx.putIfAbsent(item.getMsgIdx(), Objects.toString(item.getResultCode(), null));
                }
            }
        }
        return codeByIdx;
    }
}
