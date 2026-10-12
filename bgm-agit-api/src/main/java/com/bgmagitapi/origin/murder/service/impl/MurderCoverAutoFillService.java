package com.bgmagitapi.origin.murder.service.impl;

import com.bgmagitapi.origin.advice.exception.ValidException;
import com.bgmagitapi.origin.config.S3FileUtils;
import com.bgmagitapi.origin.config.UploadResult;
import com.bgmagitapi.origin.murder.dto.request.MurderCoverApplyRequest;
import com.bgmagitapi.origin.murder.dto.response.MurderCoverAutoFillResponse;
import com.bgmagitapi.origin.murder.entity.BgmAgitMurderGame;
import com.bgmagitapi.origin.murder.repository.BgmAgitMurderGameRepository;
import com.bgmagitapi.origin.murder.util.MurderLogCoverSearcher;
import com.bgmagitapi.origin.murder.util.MurderLogCoverSearcher.CoverCandidate;
import com.bgmagitapi.origin.murder.util.RemoteImageFetcher;
import com.bgmagitapi.origin.murder.util.RemoteImageFetcher.FetchedImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 머더 게임 표지를 머미로그에서 찾아 채운다.
 * - 후보 조회: 관리자가 정리 화면·등록 폼에서 골라 쓰게 목록만 준다
 * - 자동 채우기: 같은 게임이라고 확신할 때만 넣는다. 애매하면 건너뛰고 사유를 돌려준다
 * - 표지 넣기: 정리 화면에서 고른 후보·붙여넣은 이미지를 바로 저장한다
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
    private final MurderLogCoverSearcher coverSearcher;
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
        BgmAgitMurderGame game = findGame(id);
        if (StringUtils.hasText(game.getImageUrl())) {
            return skip(game, "이미 표지가 있습니다.");
        }

        // 줄인 검색어로 찾은 후보는 다른 편일 수 있어 자동으로는 전체 이름 검색 결과만 쓴다
        List<CoverCandidate> candidates = coverSearcher.searchExact(game.getName());
        if (candidates.isEmpty()) {
            return skip(game, "이름 그대로는 머미로그에 없습니다.");
        }
        CoverCandidate picked = pickSameGame(game.getName(), candidates);
        if (picked == null) {
            return skip(game, "후보 " + candidates.size() + "개 중 같은 게임을 확신할 수 없습니다.");
        }

        String url;
        try {
            url = store(remoteImageFetcher.fetch(picked.imageUrl()));
        } catch (ValidException e) {
            // 일괄 처리 중 한 건 실패로 전체가 멈추지 않게 사유만 돌려준다
            return skip(game, e.getMessage());
        }
        game.changeImageUrl(url);
        murderGameRepository.save(game);
        return new MurderCoverAutoFillResponse(game.getId(), game.getName(), true, "표지를 넣었습니다.", url);
    }

    /**
     * 정리 화면에서 고른 표지를 바로 넣는다. 파일이 있으면 파일, 없으면 주소(이미지·페이지)를 받아온다.
     * name 이 오면 이름도 바꾸고, 인원·시간은 **비어 있는 칸만** 채운다(사장님이 넣어 둔 값은 건드리지 않는다)
     */
    public MurderCoverAutoFillResponse applyCover(Long id, MurderCoverApplyRequest request) {
        BgmAgitMurderGame game = findGame(id);

        MultipartFile file = request.getImage();
        String url;
        if (file != null && !file.isEmpty()) {
            UploadResult uploaded = s3FileUtils.storeFile(file, S3_FOLDER);
            url = uploaded.getUrl();
        } else if (StringUtils.hasText(request.getImageSourceUrl())) {
            url = store(remoteImageFetcher.fetch(request.getImageSourceUrl()));
        } else {
            throw new ValidException("넣을 이미지가 없습니다.");
        }

        // 새 이미지를 올린 뒤에 옛 이미지를 지운다(받아오다 실패하면 옛 이미지가 남게)
        String oldUrl = game.getImageUrl();
        game.changeImageUrl(url);
        if (StringUtils.hasText(request.getName())) {
            Integer min = game.getMinPlayers() != null ? game.getMinPlayers() : request.getMinPlayers();
            Integer max = game.getMaxPlayers() != null ? game.getMaxPlayers() : request.getMaxPlayers();
            if (min != null && max != null && min > max) {
                // 한쪽만 채워 넣다 뒤집히면 원래 값 그대로 둔다
                min = game.getMinPlayers();
                max = game.getMaxPlayers();
            }
            Integer minutes = game.getPlayMinutes() != null ? game.getPlayMinutes() : request.getPlayMinutes();
            game.update(request.getName().trim(), min, max, minutes);
        }
        murderGameRepository.save(game);

        if (StringUtils.hasText(oldUrl)) {
            try {
                s3FileUtils.deleteFile(oldUrl);
            } catch (Exception ignore) {
                // S3 삭제 실패는 무시 (DB 정합성 우선)
            }
        }
        return new MurderCoverAutoFillResponse(game.getId(), game.getName(), true, "표지를 넣었습니다.", url);
    }

    /**
     * 같은 게임이라고 확신할 수 있는 후보 하나. 없으면 null — 건너뛰고 사람이 고른다.
     * 표지 없던 161개를 머미로그에 검색해 보고 정한 규칙(2026-10-12):
     * - 이름이 정확히 같은 후보가 하나이고 후보 전체가 3개 이하
     * - 후보가 딱 하나이고 그 이름에 우리 이름이 통째로 들어 있다. 머미로그는 머더미스터리만 있어서
     *   "햇살고아원" → "햇살고아원: 여섯 아이의 탈출극", "최종 프로토콜" → "마이 머더 미스터리: 최종 프로토콜" 이 맞다.
     *   너무 짧은 이름(1글자)은 제외
     */
    static CoverCandidate pickSameGame(String gameName, List<CoverCandidate> candidates) {
        String key = MurderLogCoverSearcher.normalize(gameName);
        if (key.isEmpty()) return null;

        List<CoverCandidate> exact = candidates.stream()
                .filter(c -> MurderLogCoverSearcher.normalize(c.title()).equals(key))
                .toList();
        if (exact.size() == 1 && candidates.size() <= 3) {
            return exact.get(0);
        }
        if (exact.isEmpty() && candidates.size() == 1 && key.length() >= 2
                && MurderLogCoverSearcher.normalize(candidates.get(0).title()).contains(key)) {
            return candidates.get(0);
        }
        return null;
    }

    private String store(FetchedImage image) {
        return s3FileUtils.storeBytes(image.bytes(), image.contentType(), image.ext(), S3_FOLDER).getUrl();
    }

    private BgmAgitMurderGame findGame(Long id) {
        return murderGameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
    }

    private MurderCoverAutoFillResponse skip(BgmAgitMurderGame game, String reason) {
        return new MurderCoverAutoFillResponse(game.getId(), game.getName(), false, reason, null);
    }
}
