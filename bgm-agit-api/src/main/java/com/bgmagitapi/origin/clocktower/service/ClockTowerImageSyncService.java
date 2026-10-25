package com.bgmagitapi.origin.clocktower.service;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerImageStatusResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerImageSyncResult;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerRoleRepository;
import com.bgmagitapi.origin.clocktower.service.impl.ClockTowerRoleWriter;
import com.bgmagitapi.origin.clocktower.util.ClockTowerImageClient;
import com.bgmagitapi.origin.clocktower.util.ClockTowerImagePaths;
import com.bgmagitapi.origin.clocktower.util.ClockTowerImagePaths.Variant;
import com.bgmagitapi.origin.config.S3FileUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 공식 캐릭터 이미지를 우리 S3 로 복사한다(원본 주소는 바뀔 수 있어 자체 사본을 쓴다).
 * 관리자 화면이 상태를 받아 빠진 것을 30개씩 순차 호출한다 — 한 요청에 377장을 다 받으면 nginx 타임아웃.
 *
 * 외부 호출 동안 DB 트랜잭션을 잡지 않는다(NOT_SUPPORTED). 한 장 올릴 때마다 writer 의 짧은 트랜잭션으로 반영한다.
 * 키가 경로로 정해져 있어 같은 요청을 반복해도 같은 객체를 덮어쓸 뿐이다(멱등).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public class ClockTowerImageSyncService {

    // 공식 아트가 바뀔 수 있어 immutable 은 쓰지 않는다
    private static final String CACHE_CONTROL = "public, max-age=2592000";
    private static final int RETRIES = 2;
    // 요청당 시간 예산(nginx 60초 안). 넘으면 남은 것은 NOT_RUN 으로 돌려 화면이 다음 호출로 넘긴다
    private static final long TIME_BUDGET_MS = 20_000;

    private final BgmAgitClockTowerRoleRepository roleRepository;
    private final ClockTowerRoleWriter roleWriter;
    private final ClockTowerImageClient imageClient;
    private final S3FileUtils s3FileUtils;

    public ClockTowerImageStatusResponse status() {
        Map<String, Target> targets = targets();
        List<String> missing = new ArrayList<>();
        int done = 0;
        for (Map.Entry<String, Target> e : targets.entrySet()) {
            if (isDone(e.getKey(), e.getValue())) done++;
            else missing.add(e.getKey());
        }
        return new ClockTowerImageStatusResponse(targets.size(), done, missing, new ArrayList<>(targets.keySet()));
    }

    public List<ClockTowerImageSyncResult> sync(List<String> paths, boolean force) {
        Map<String, Target> targets = targets();
        // 형식(정규식)과 화이트리스트(상태가 계산한 경로)를 둘 다 통과해야 원본 주소를 만든다
        for (String path : paths) {
            if (ClockTowerImagePaths.parse(path) == null || !targets.containsKey(path)) {
                throw new ValidException("복사할 수 없는 경로입니다: " + path);
            }
        }

        long started = System.currentTimeMillis();
        List<ClockTowerImageSyncResult> results = new ArrayList<>();
        for (String path : paths) {
            if (System.currentTimeMillis() - started > TIME_BUDGET_MS) {
                results.add(new ClockTowerImageSyncResult(path, "NOT_RUN", "시간이 모자라 다음 차례로 넘깁니다."));
                continue;
            }
            Target target = targets.get(path);
            if (!force && isDone(path, target)) {
                results.add(new ClockTowerImageSyncResult(path, "SKIPPED", "이미 복사했습니다."));
                continue;
            }
            results.add(copy(path, target, started));
        }
        return results;
    }

    // =========================== helpers ===========================

    /** 복사 대상 한 장. role 이 null 이면 generic(진영 기본) 이미지 */
    private record Target(BgmAgitClockTowerRole role, Variant variant) {
    }

    /** 복사해야 할 전체 경로. 공식 사전(판본 폴더가 있는 캐릭터) + generic 22장 */
    private Map<String, Target> targets() {
        Map<String, Target> targets = new LinkedHashMap<>();
        for (BgmAgitClockTowerRole role : roleRepository.findOfficialRoles()) {
            if (role.getTeam() == null || !ClockTowerImagePaths.isOfficialEdition(role.getEdition())) continue;
            if (!role.getRoleKey().matches("[a-z0-9]+")) continue;
            for (Variant v : ClockTowerImagePaths.variantsOf(role.getTeam())) {
                targets.put(ClockTowerImagePaths.path(role.getEdition(), role.getRoleKey(), v), new Target(role, v));
            }
        }
        for (String name : ClockTowerImagePaths.GENERIC_NAMES) {
            targets.put(ClockTowerImagePaths.genericPath(name), new Target(null, Variant.PLAIN));
        }
        return targets;
    }

    // 캐릭터는 사전 컬럼으로, generic 은 S3 에 실제로 있는지로 본다(DB 에 둘 자리가 없다)
    private boolean isDone(String path, Target target) {
        if (target.role() != null) return target.role().hasImage(target.variant());
        try {
            return s3FileUtils.exists(ClockTowerImagePaths.s3Key(path));
        } catch (Exception e) {
            log.warn("[clocktower] 이미지 존재 확인 실패 {}: {}", path, e.getMessage());
            return false;
        }
    }

    private ClockTowerImageSyncResult copy(String path, Target target, long started) {
        String lastError = null;
        for (int attempt = 0; attempt <= RETRIES; attempt++) {
            // 한 장이 재시도까지 하면 최대 36초(연결 4 + 읽기 8, 3번) — 시작할 때만 보면 요청이 nginx 60초에 닿는다
            if (attempt > 0 && System.currentTimeMillis() - started > TIME_BUDGET_MS) {
                return new ClockTowerImageSyncResult(path, "NOT_RUN", "시간이 모자라 다음 차례로 넘깁니다.");
            }
            try {
                ClockTowerImageClient.Fetched fetched = imageClient.fetch(path);
                if (!fetched.found()) {
                    return new ClockTowerImageSyncResult(path, "SKIPPED", "원본에 없는 파일입니다.");
                }
                String url = s3FileUtils.putAt(ClockTowerImagePaths.s3Key(path), fetched.bytes(),
                        fetched.contentType(), CACHE_CONTROL);
                if (target.role() != null) {
                    roleWriter.markImageSynced(target.role().getRoleKey(), target.variant(), url);
                }
                return new ClockTowerImageSyncResult(path, "COPIED", null);
            } catch (IOException e) {
                lastError = e.getMessage();
            } catch (Exception e) {
                // S3·DB 오류는 재시도해도 같을 가능성이 높아 바로 실패로 돌린다
                log.warn("[clocktower] 이미지 복사 실패 {}: {}", path, e.getMessage());
                return new ClockTowerImageSyncResult(path, "FAILED", "저장에 실패했습니다.");
            }
        }
        log.warn("[clocktower] 이미지 받기 실패 {}: {}", path, lastError);
        return new ClockTowerImageSyncResult(path, "FAILED", "원본을 받지 못했습니다(" + lastError + ").");
    }
}
