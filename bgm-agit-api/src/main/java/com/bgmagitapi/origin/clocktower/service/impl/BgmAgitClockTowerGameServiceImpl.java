package com.bgmagitapi.origin.clocktower.service.impl;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerCharacterInput;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameCreateRequest;
import com.bgmagitapi.origin.clocktower.dto.request.ClockTowerGameModifyRequest;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerCharacterResponse;
import com.bgmagitapi.origin.clocktower.dto.response.ClockTowerGameResponse;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerCharacter;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerGame;
import com.bgmagitapi.origin.clocktower.entity.BgmAgitClockTowerRole;
import com.bgmagitapi.origin.clocktower.util.ClockTowerSessionRules;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerCharacterRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerGameRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerRecordRepository;
import com.bgmagitapi.origin.clocktower.repository.BgmAgitClockTowerRoleRepository;
import com.bgmagitapi.origin.clocktower.service.BgmAgitClockTowerGameService;
import com.bgmagitapi.origin.config.S3FileUtils;
import com.bgmagitapi.origin.config.UploadResult;
import com.bgmagitapi.origin.entity.enumeration.ClockTowerCharacterType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BgmAgitClockTowerGameServiceImpl implements BgmAgitClockTowerGameService {

    private static final String S3_FOLDER = "clocktower-game";

    private final BgmAgitClockTowerGameRepository gameRepository;
    private final BgmAgitClockTowerCharacterRepository characterRepository;
    private final BgmAgitClockTowerRecordRepository recordRepository;
    private final BgmAgitClockTowerRoleRepository roleRepository;
    private final S3FileUtils s3FileUtils;
    private final ObjectMapper objectMapper;

    // 캐릭터 이미지 끄기 스위치(BgmAgitClockTowerRoleServiceImpl 과 같은 설정)
    @Value("${clocktower.images-enabled:true}")
    private boolean imagesEnabled;

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
        List<BgmAgitClockTowerCharacter> rows = characterRepository.findByGame_IdOrderByOrdersAsc(id);
        // 캐릭터 시트(게임 상세)에도 그림을 보여준다. 사전 키로 한 번에 찾는다
        Map<String, BgmAgitClockTowerRole> dict = imagesEnabled
                ? roleRepository.findByRoleKeys(rows.stream().map(BgmAgitClockTowerCharacter::getRoleKey).filter(Objects::nonNull).toList())
                        .stream()
                        .collect(Collectors.toMap(BgmAgitClockTowerRole::getRoleKey, Function.identity(), (a, b) -> a))
                : Map.of();
        List<ClockTowerCharacterResponse> characters = rows.stream()
                .map(c -> ClockTowerCharacterResponse.of(c, imageOf(c, dict.get(c.getRoleKey()))))
                .toList();
        return ClockTowerGameResponse.of(game, characters);
    }

    /** 캐릭터 기본 진영 그림(주민·외지인 = 선, 하수인·악마 = 악, 여행자·전설 = 무진영) */
    private String imageOf(BgmAgitClockTowerCharacter c, BgmAgitClockTowerRole r) {
        if (r == null) return null;
        Boolean evil = ClockTowerSessionRules.displayEvil(null, c.getCharacterType());
        return ClockTowerSessionRules.pickImage(evil, r.getImageUrl(), r.getImageGoodUrl(), r.getImageEvilUrl());
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
        roleRepository.deleteByGameId(id); // 이 스크립트 전용 자작 캐릭터
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
                    game, in.getName().trim(), type, in.getDescription(), order++,
                    StringUtils.hasText(in.getRoleKey()) ? in.getRoleKey().trim() : null));
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
