package com.bgmagitapi.security.service.kml;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.repository.BgmAgitMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class KmlSyncService {

    private final BgmAgitMemberRepository bgmAgitMemberRepository;
    private final KmlUserClient kmlUserClient;

    public void retryAll() {
        List<BgmAgitMember> candidates = bgmAgitMemberRepository.findByBgmAgitMemberKmlSynk("N");
        log.info("[KML-SYNC] 재시도 대상 {}건", candidates.size());

        int linked = 0;
        for (BgmAgitMember member : candidates) {
            Long id = kmlUserClient.findSingleKmlIdByNickname(member.getBgmAgitMemberNickname()).orElse(null);
            if (id != null) {
                member.linkKml(id);
                linked++;
            }
        }
        log.info("[KML-SYNC] 완료: 연결 성공 {}건 / 재시도 대기 {}건", linked, candidates.size() - linked);
    }
}
