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

    public MurderCoverAutoFillResponse autoFill(Long id) {
        BgmAgitMurderGame game = murderGameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
        if (StringUtils.hasText(game.getImageUrl())) {
            return skip(game, "이미 표지가 있습니다.");
        }

        String key = BoardlifeCoverSearcher.normalize(game.getName());
        FetchedImage image;
        try {
            List<CoverCandidate> matches = coverSearcher.search(game.getName()).stream()
                    .filter(c -> BoardlifeCoverSearcher.normalize(c.title()).equals(key))
                    .toList();
            if (matches.isEmpty()) {
                return skip(game, "보드라이프에 이름이 똑같은 게임이 없습니다.");
            }
            if (matches.stream().map(CoverCandidate::imageUrl).distinct().count() > 1) {
                return skip(game, "같은 이름의 게임이 여러 개입니다.");
            }
            image = remoteImageFetcher.fetch(matches.get(0).imageUrl());
        } catch (ValidException e) {
            // 일괄 처리 중 한 건 실패로 전체가 멈추지 않게 사유만 돌려준다
            return skip(game, e.getMessage());
        }

        UploadResult uploaded = s3FileUtils.storeBytes(image.bytes(), image.contentType(), image.ext(), S3_FOLDER);
        game.changeImageUrl(uploaded.getUrl());
        murderGameRepository.save(game);
        return new MurderCoverAutoFillResponse(game.getId(), game.getName(), true, "표지를 넣었습니다.", uploaded.getUrl());
    }

    private MurderCoverAutoFillResponse skip(BgmAgitMurderGame game, String reason) {
        return new MurderCoverAutoFillResponse(game.getId(), game.getName(), false, reason, null);
    }
}
