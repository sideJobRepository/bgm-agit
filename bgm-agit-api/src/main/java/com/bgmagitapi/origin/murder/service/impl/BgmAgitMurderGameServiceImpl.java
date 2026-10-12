package com.bgmagitapi.origin.murder.service.impl;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.murder.dto.request.MurderGameCreateRequest;
import com.bgmagitapi.origin.murder.dto.request.MurderGameModifyRequest;
import com.bgmagitapi.origin.murder.dto.response.MurderGameResponse;
import com.bgmagitapi.origin.murder.entity.BgmAgitMurderGame;
import com.bgmagitapi.origin.murder.repository.BgmAgitMurderGameRepository;
import com.bgmagitapi.origin.murder.repository.BgmAgitPlayRecordRepository;
import com.bgmagitapi.origin.murder.service.BgmAgitMurderGameService;
import com.bgmagitapi.origin.murder.util.MurderCoverStorage;
import com.bgmagitapi.origin.murder.util.RemoteImageFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitMurderGameServiceImpl implements BgmAgitMurderGameService {

    private final BgmAgitMurderGameRepository murderGameRepository;
    private final BgmAgitPlayRecordRepository playRecordRepository;
    private final MurderCoverStorage coverStorage;
    private final RemoteImageFetcher remoteImageFetcher;

    @Override
    @Transactional(readOnly = true)
    public Page<MurderGameResponse> getMurderGames(Pageable pageable, String keyword) {
        String kw = keyword == null ? "" : keyword.trim();
        return murderGameRepository
                .findByUseStatusAndNameContaining("Y", kw, pageable)
                .map(MurderGameResponse::of);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MurderGameResponse> getSimpleGames() {
        return murderGameRepository.findByUseStatusOrderByNameAsc("Y")
                .stream()
                .map(MurderGameResponse::of)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MurderGameResponse getMurderGame(Long id) {
        BgmAgitMurderGame game = murderGameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
        return MurderGameResponse.of(game);
    }

    @Override
    public ApiResponse createMurderGame(MurderGameCreateRequest request) {
        validatePlayers(request.getMinPlayers(), request.getMaxPlayers());

        String imageUrl = uploadIfPresent(request.getImage(), request.getImageSourceUrl());
        BgmAgitMurderGame game = new BgmAgitMurderGame(
                request.getName(),
                request.getMinPlayers(),
                request.getMaxPlayers(),
                request.getPlayMinutes(),
                imageUrl
        );
        murderGameRepository.save(game);
        return new ApiResponse(200, true, "게임이 등록되었습니다.");
    }

    @Override
    public ApiResponse modifyMurderGame(Long id, MurderGameModifyRequest request) {
        BgmAgitMurderGame game = murderGameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
        validatePlayers(request.getMinPlayers(), request.getMaxPlayers());

        game.update(request.getName(), request.getMinPlayers(), request.getMaxPlayers(), request.getPlayMinutes());

        MultipartFile newImage = request.getImage();
        boolean hasNewFile = newImage != null && !newImage.isEmpty();
        if (hasNewFile || StringUtils.hasText(request.getImageSourceUrl())) {
            // 새 이미지로 교체. 주소로 받아오다 실패하면 기존 이미지가 남도록 업로드 후에 지운다
            String newUrl = uploadIfPresent(newImage, request.getImageSourceUrl());
            deleteImageIfPresent(game.getImageUrl());
            game.changeImageUrl(newUrl);
        } else if (Boolean.TRUE.equals(request.getRemoveImage())) {
            // 이미지 제거
            deleteImageIfPresent(game.getImageUrl());
            game.changeImageUrl(null);
        }
        return new ApiResponse(200, true, "게임이 수정되었습니다.");
    }

    @Override
    public ApiResponse deleteMurderGame(Long id) {
        BgmAgitMurderGame game = murderGameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));

        if (playRecordRepository.existsByMurderGame_Id(id)) {
            // 플레이 기록이 있으면 이력 보존을 위해 소프트 삭제
            game.softDelete();
            return new ApiResponse(200, true, "플레이 기록이 있어 목록에서만 숨겼습니다.");
        }
        // 참조 없으면 물리 삭제 + S3 이미지 삭제
        deleteImageIfPresent(game.getImageUrl());
        murderGameRepository.delete(game);
        return new ApiResponse(200, true, "게임이 삭제되었습니다.");
    }

    // =========================== helpers ===========================

    private void validatePlayers(Integer min, Integer max) {
        if (min != null && min < 1) throw new IllegalArgumentException("최소 인원이 올바르지 않습니다.");
        if (max != null && max < 1) throw new IllegalArgumentException("최대 인원이 올바르지 않습니다.");
        if (min != null && max != null && min > max) {
            throw new IllegalArgumentException("최소 인원이 최대 인원보다 클 수 없습니다.");
        }
    }

    // 파일이 있으면 파일, 없고 주소가 있으면 서버가 받아와 올린다. 둘 다 크기를 맞춰 올린다
    private String uploadIfPresent(MultipartFile image, String sourceUrl) {
        if (image != null && !image.isEmpty()) {
            return coverStorage.store(image);
        }
        if (StringUtils.hasText(sourceUrl)) {
            return coverStorage.store(remoteImageFetcher.fetch(sourceUrl));
        }
        return null;
    }

    private void deleteImageIfPresent(String imageUrl) {
        if (StringUtils.hasText(imageUrl)) {
            coverStorage.delete(imageUrl);
        }
    }
}
