package com.bgmagitapi.origin.clocktower.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

/**
 * 이야기꾼 진행판용 묶음: 스크립트 캐릭터 + 밤 특수 단계 + 이 스크립트에 걸리는 징크스.
 * 진행 상태(누가 어떤 캐릭터인지)는 서버에 두지 않는다 — 진행판 기기 localStorage 에만 있다.
 */
@Getter
@Builder
public class ClockTowerGrimoireResponse {

    private Long gameId;
    private String gameName;
    private List<Role> roles;
    private List<Role> nightSteps;
    private List<Jinx> jinxes;
    // 진영 기본 이미지(이름 → 주소, 예: townsfolk_e). 캐릭터 이미지가 없거나 못 불러올 때 대신 쓴다. 이미지 기능을 끄면 빈 맵
    private Map<String, String> genericImages;

    /**
     * @param key         사전 키. 직접 입력한 캐릭터는 "c{캐릭터ID}"
     * @param characterId 기록 저장 때 쓰는 시나리오 캐릭터 행 id(밤 특수 단계는 null)
     * @param image       무진영 이미지(여행자·전설·로릭, 자작은 기본 진영), imageGood/imageEvil 은 선·악 이미지
     */
    @Builder
    public record Role(String key,
                       Long characterId,
                       String name,
                       String team,
                       String ability,
                       Integer firstNightOrder,
                       Integer otherNightOrder,
                       String firstNightText,
                       String otherNightText,
                       List<String> reminders,
                       List<String> remindersGlobal,
                       boolean setup,
                       String image,
                       String imageGood,
                       String imageEvil) {
    }

    public record Jinx(String roleA, String roleB, String reason) {
    }
}
