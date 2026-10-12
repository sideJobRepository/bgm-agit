package com.bgmagitapi.origin.murder.service.impl;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.config.S3FileUtils;
import com.bgmagitapi.origin.config.UploadResult;
import com.bgmagitapi.origin.murder.dto.response.MurderCoverAutoFillResponse;
import com.bgmagitapi.origin.murder.entity.BgmAgitMurderGame;
import com.bgmagitapi.origin.murder.repository.BgmAgitMurderGameRepository;
import com.bgmagitapi.origin.murder.util.BoardlifeCoverSearcher;
import com.bgmagitapi.origin.murder.util.BoardlifeCoverSearcher.CoverCandidate;
import com.bgmagitapi.origin.murder.util.RemoteImageFetcher;
import com.bgmagitapi.origin.murder.util.RemoteImageFetcher.FetchedImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 머더 게임 표지를 보드라이프에서 찾아 채운다.
 * - 후보 조회: 관리자가 등록 폼에서 골라 쓰게 목록만 준다
 * - 자동 채우기: 게임명이 정확히 하나와 일치할 때만 넣는다. 애매하면 건너뛰고 사유를 돌려준다
 *
 * 외부 사이트를 몇 초씩 기다리므로 그동안 DB 커넥션을 잡지 않게 트랜잭션 밖에서 돌고 저장만 save 로 한다.
 * 일괄 처리는 프론트가 한 건씩 부른다 — 서버에서 수십 건을 한 요청으로 돌리면 nginx 타임아웃에 걸린다
 */
@Service
@RequiredArgsConstructor
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public class MurderCoverAutoFillService {

    private static final String S3_FOLDER = "murder-game";

    private final BgmAgitMurderGameRepository murderGameRepository;
    private final BoardlifeCoverSearcher coverSearcher;
    private final RemoteImageFetcher remoteImageFetcher;
    private final S3FileUtils s3FileUtils;

    public List<CoverCandidate> findCandidates(String name) {
        return coverSearcher.search(name);
    }

    // 붙여넣은 주소가 가리키는 실제 이미지 주소(페이지면 대표 이미지). 등록 폼 미리보기용
    public String resolveImageUrl(String url) {
        return remoteImageFetcher.resolveImageUrl(url);
    }

    public MurderCoverAutoFillResponse autoFill(Long id) {
        BgmAgitMurderGame game = murderGameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
        if (StringUtils.hasText(game.getImageUrl())) {
            return skip(game, "이미 표지가 있습니다.");
        }

        FetchedImage image;
        try {
            List<CoverCandidate> candidates = coverSearcher.search(game.getName());
            if (candidates.isEmpty()) {
                return skip(game, "보드라이프에 없습니다.");
            }
            CoverCandidate picked = pickSameGame(game.getName(), candidates);
            if (picked == null) {
                return skip(game, "후보 " + candidates.size() + "개 중 같은 게임을 확신할 수 없습니다.");
            }
            image = remoteImageFetcher.fetch(picked.imageUrl());
        } catch (ValidException e) {
            // 일괄 처리 중 한 건 실패로 전체가 멈추지 않게 사유만 돌려준다
            return skip(game, e.getMessage());
        }

        UploadResult uploaded = s3FileUtils.storeBytes(image.bytes(), image.contentType(), image.ext(), S3_FOLDER);
        game.changeImageUrl(uploaded.getUrl());
        murderGameRepository.save(game);
        return new MurderCoverAutoFillResponse(game.getId(), game.getName(), true, "표지를 넣었습니다.", uploaded.getUrl());
    }

    /**
     * 같은 게임이라고 확신할 수 있는 후보 하나. 없으면 null — 건너뛰고 사람이 고른다.
     * 운영 게임 241개로 돌려 보고 정한 규칙(2026-10-12):
     * - 이름이 정확히 같은 후보가 하나이고 후보 전체가 3개 이하. "타워"·"이프"·"보물섬"처럼 짧은 이름은
     *   일반 보드게임과 이름이 같아(후보 5~30개) 정확히 같아도 다른 게임 표지가 붙는다
     * - 후보가 딱 하나이고 그 이름이 우리 이름으로 끝난다. "머더 미스터리 미니: 시체와 온천" 처럼 시리즈명이 앞에 붙는 경우.
     *   "끝난다"로 한정해야 "별의 추락" → "검은별의 추락 - 시나리오 팩" 같은 오답이 안 붙는다. 너무 짧은 이름은 제외
     */
    static CoverCandidate pickSameGame(String gameName, List<CoverCandidate> candidates) {
        String key = BoardlifeCoverSearcher.normalize(gameName);
        if (key.isEmpty()) return null;

        List<CoverCandidate> exact = candidates.stream()
                .filter(c -> BoardlifeCoverSearcher.normalize(c.title()).equals(key))
                .toList();
        if (exact.size() == 1 && candidates.size() <= 3) {
            return exact.get(0);
        }
        if (exact.isEmpty() && candidates.size() == 1 && key.length() >= 4
                && BoardlifeCoverSearcher.normalize(candidates.get(0).title()).endsWith(key)) {
            return candidates.get(0);
        }
        return null;
    }

    private MurderCoverAutoFillResponse skip(BgmAgitMurderGame game, String reason) {
        return new MurderCoverAutoFillResponse(game.getId(), game.getName(), false, reason, null);
    }
}
