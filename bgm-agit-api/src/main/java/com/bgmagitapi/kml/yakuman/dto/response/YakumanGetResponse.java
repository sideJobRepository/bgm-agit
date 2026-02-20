package com.bgmagitapi.kml.yakuman.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class YakumanGetResponse {
    
    private Long memberId;
    private String nickname;
    
    private Long totalCount; // 총합 횟수
    private Long countedYakuman;        // 헤아림 역만
    private Long suukantsu;             // 사깡즈
    private Long suuankou;              // 사암각
    private Long kokushiMusou;          // 국사국쌍
    private Long daisangen;             // 대삼원
    private Long tenhou;                // 천화
    private Long chiihou;               // 지화
    private Long chuurenPoutou;         // 구련보등
    private Long ryuuiisou;             // 녹일색
    private Long chinroutou;            // 청노두
    private Long tsuuiisou;             // 자일색
    private Long shousuushii;           // 소사희
    private Long daisuushii;            // 대사희
    private Long kokushi13Wait;         // 국사무쌍 13면 대기
    private Long pureChuuren;           // 순정 구련보등
    private Long suuankouTanki;         // 사암각 단기
    private Long sharin;                // 사리엔커
    
    @QueryProjection
    public YakumanGetResponse(Long memberId, String nickname, Long totalCount, Long countedYakuman, Long suukantsu, Long suuankou, Long kokushiMusou, Long daisangen, Long tenhou, Long chiihou, Long chuurenPoutou, Long ryuuiisou, Long chinroutou, Long tsuuiisou, Long shousuushii, Long daisuushii, Long kokushi13Wait, Long pureChuuren, Long suuankouTanki, Long sharin) {
        this.memberId = memberId;
        this.nickname = nickname;
        this.totalCount = totalCount;
        this.countedYakuman = countedYakuman;
        this.suukantsu = suukantsu;
        this.suuankou = suuankou;
        this.kokushiMusou = kokushiMusou;
        this.daisangen = daisangen;
        this.tenhou = tenhou;
        this.chiihou = chiihou;
        this.chuurenPoutou = chuurenPoutou;
        this.ryuuiisou = ryuuiisou;
        this.chinroutou = chinroutou;
        this.tsuuiisou = tsuuiisou;
        this.shousuushii = shousuushii;
        this.daisuushii = daisuushii;
        this.kokushi13Wait = kokushi13Wait;
        this.pureChuuren = pureChuuren;
        this.suuankouTanki = suuankouTanki;
        this.sharin = sharin;
    }
}
