package com.bgmagitapi.clocktower.service.impl;

import com.bgmagitapi.apiresponse.ApiResponse;
import com.bgmagitapi.clocktower.dto.request.ClockTowerCharacterInput;
import com.bgmagitapi.clocktower.dto.request.ClockTowerGameCreateRequest;
import com.bgmagitapi.clocktower.dto.request.ClockTowerGameModifyRequest;
import com.bgmagitapi.clocktower.dto.response.ClockTowerCharacterResponse;
import com.bgmagitapi.clocktower.dto.response.ClockTowerGameResponse;
import com.bgmagitapi.clocktower.entity.BgmAgitClockTowerCharacter;
import com.bgmagitapi.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.clocktower.repository.BgmAgitClockTowerCharacterRepository;
import com.bgmagitapi.clocktower.repository.BgmAgitClockTowerGameRepository;
import com.bgmagitapi.clocktower.repository.BgmAgitClockTowerRecordRepository;
import com.bgmagitapi.clocktower.service.BgmAgitClockTowerGameService;
import com.bgmagitapi.config.S3FileUtils;
import com.bgmagitapi.config.UploadResult;
import com.bgmagitapi.entity.enumeration.ClockTowerCharacterType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitClockTowerGameServiceImpl implements BgmAgitClockTowerGameService {

    private static final String S3_FOLDER = "clocktower-game";

    private final BgmAgitClockTowerGameRepository gameRepository;
    private final BgmAgitClockTowerCharacterRepository characterRepository;
    private final BgmAgitClockTowerRecordRepository recordRepository;
    private final S3FileUtils s3FileUtils;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ClockTowerGameResponse> getGames(Pageable pageable, String keyword) {
        String kw = keyword == null ? "" : keyword.trim();
        return gameRepository.findByUseStatusAndNameContaining("Y", kw, pageable)
                .map(ClockTowerGameResponse::of);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClockTowerGameResponse> getSimpleGames() {
        return gameRepository.findByUseStatusOrderByNameAsc("Y")
                .stream()
                .map(ClockTowerGameResponse::of)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClockTowerGameResponse getGame(Long id) {
        BgmAgitClockTowerGame game = gameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
        List<ClockTowerCharacterResponse> characters = characterRepository.findByGame_IdOrderByOrdersAsc(id)
                .stream()
                .map(ClockTowerCharacterResponse::of)
                .toList();
        return ClockTowerGameResponse.of(game, characters);
    }

    @Override
    public ApiResponse createGame(ClockTowerGameCreateRequest request) {
        validatePlayers(request.getMinPlayers(), request.getMaxPlayers());

        String imageUrl = uploadIfPresent(request.getImage());
        BgmAgitClockTowerGame game = gameRepository.save(new BgmAgitClockTowerGame(
                request.getName(),
                request.getMinPlayers(),
                request.getMaxPlayers(),
                request.getPlayMinutes(),
                imageUrl
        ));
        saveCharacters(game, request.getCharacters());
        return new ApiResponse(200, true, "게임이 등록되었습니다.");
    }

    @Override
    public ApiResponse modifyGame(Long id, ClockTowerGameModifyRequest request) {
        BgmAgitClockTowerGame game = gameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));
        validatePlayers(request.getMinPlayers(), request.getMaxPlayers());

        game.update(request.getName(), request.getMinPlayers(), request.getMaxPlayers(), request.getPlayMinutes());

        MultipartFile newImage = request.getImage();
        if (newImage != null && !newImage.isEmpty()) {
            deleteImageIfPresent(game.getImageUrl());
            game.changeImageUrl(uploadIfPresent(newImage));
        } else if (Boolean.TRUE.equals(request.getRemoveImage())) {
            deleteImageIfPresent(game.getImageUrl());
            game.changeImageUrl(null);
        }

        // 캐릭터 목록 전체 재구성 (참가자는 이름·역할군 스냅샷이라 영향 없음)
        characterRepository.deleteByGame_Id(id);
        saveCharacters(game, request.getCharacters());
        return new ApiResponse(200, true, "게임이 수정되었습니다.");
    }

    @Override
    public ApiResponse deleteGame(Long id) {
        BgmAgitClockTowerGame game = gameRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게임입니다."));

        if (recordRepository.existsByGame_Id(id)) {
            game.softDelete();
            return new ApiResponse(200, true, "플레이 기록이 있어 목록에서만 숨겼습니다.");
        }
        characterRepository.deleteByGame_Id(id);
        deleteImageIfPresent(game.getImageUrl());
        gameRepository.delete(game);
        return new ApiResponse(200, true, "게임이 삭제되었습니다.");
    }

    // =========================== helpers ===========================

    private void saveCharacters(BgmAgitClockTowerGame game, String charactersJson) {
        List<ClockTowerCharacterInput> inputs = parseCharacters(charactersJson);
        int order = 0;
        for (ClockTowerCharacterInput in : inputs) {
            if (in == null || !StringUtils.hasText(in.getName())) continue;
            ClockTowerCharacterType type = parseType(in.getType());
            characterRepository.save(new BgmAgitClockTowerCharacter(
                    game, in.getName().trim(), type, in.getDescription(), order++));
        }
    }

    private List<ClockTowerCharacterInput> parseCharacters(String json) {
        if (!StringUtils.hasText(json)) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<ClockTowerCharacterInput>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("캐릭터 목록 형식이 올바르지 않습니다.");
        }
    }

    private ClockTowerCharacterType parseType(String type) {
        if (!StringUtils.hasText(type)) return null;
        try {
            return ClockTowerCharacterType.valueOf(type.trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private void validatePlayers(Integer min, Integer max) {
        if (min != null && min < 1) throw new IllegalArgumentException("최소 인원이 올바르지 않습니다.");
        if (max != null && max < 1) throw new IllegalArgumentException("최대 인원이 올바르지 않습니다.");
        if (min != null && max != null && min > max) {
            throw new IllegalArgumentException("최소 인원이 최대 인원보다 클 수 없습니다.");
        }
    }

    private String uploadIfPresent(MultipartFile image) {
        if (image == null || image.isEmpty()) return null;
        UploadResult result = s3FileUtils.storeFile(image, S3_FOLDER);
        return result != null ? result.getUrl() : null;
    }

    private void deleteImageIfPresent(String imageUrl) {
        if (StringUtils.hasText(imageUrl)) {
            try {
                s3FileUtils.deleteFile(imageUrl);
            } catch (Exception ignore) {
            }
        }
    }
}
