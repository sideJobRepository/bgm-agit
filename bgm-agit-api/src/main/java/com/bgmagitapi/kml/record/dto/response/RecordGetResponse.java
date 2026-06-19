package com.bgmagitapi.kml.record.dto.response;

import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.record.enums.Wind;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordGetResponse {
    

    private Long matchsId;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime registDate;
    private String tournamentStatus;
    // 대회 기록일 때만 채워짐 (tournamentStatus = 'Y' AND matchs.tournament != null)
    private String tournamentName;
    private MatchsWind matchsWind;
    private String createNicname;
    // 'Y' 면 삭제된 기록 (멘토 이상에게만 노출), 'N' 정상
    private String delStatus;
    private List<Row> rows;
    // 이 대국에서 화료된 역만 목록 (없으면 빈 배열)
    private List<YakumanInfo> yakumans;
    // 이 대국에서 화료된 삼배만 목록 (없으면 빈 배열)
    private List<SanbaemanInfo> sanbaemans;

    public List<Row> getRows() {
        if(this.rows == null) {
            this.rows = new ArrayList<>();
        }
        return this.rows;
    }

    public List<YakumanInfo> getYakumans() {
        if(this.yakumans == null) {
            this.yakumans = new ArrayList<>();
        }
        return this.yakumans;
    }

    public List<SanbaemanInfo> getSanbaemans() {
        if(this.sanbaemans == null) {
            this.sanbaemans = new ArrayList<>();
        }
        return this.sanbaemans;
    }

    @Data
    public static class Row {
        private String seat;      // 東 / 南 / 西 / 北
        private Integer rank;
        private String nickname;
        private Integer score;
        private Double point;
        private boolean winner;   // 1등 강조용
    }

    @Data
    @NoArgsConstructor
    public static class YakumanInfo {
        // 그룹핑 전용 (응답에는 노출 안 함)
        @JsonIgnore
        private Long matchsId;
        private String nickname;   // 화료자
        private String yakumanName; // 역만 이름 (예: 구련보등)
        // legacy: BgmAgitCommonFile 의 풀 URL (구버전 데이터용)
        private String imageUrl;
        // new: BgmAgitFile 의 ID. 프론트가 /file-view 로 presigned URL 조회
        private Long fileId;

        @QueryProjection
        public YakumanInfo(Long matchsId, String nickname, String yakumanName, String imageUrl, Long fileId) {
            this.matchsId = matchsId;
            this.nickname = nickname;
            this.yakumanName = yakumanName;
            this.imageUrl = imageUrl;
            this.fileId = fileId;
        }
    }

    @Data
    @NoArgsConstructor
    public static class SanbaemanInfo {
        // 그룹핑 전용 (응답에는 노출 안 함)
        @JsonIgnore
        private Long matchsId;
        private String nickname;       // 화료자
        private String sanbaemanName;  // 역 이름
        // legacy: BgmAgitCommonFile 의 풀 URL (구버전 데이터용)
        private String imageUrl;
        // new: BgmAgitFile 의 ID. 프론트가 /file-view 로 presigned URL 조회
        private Long fileId;

        @QueryProjection
        public SanbaemanInfo(Long matchsId, String nickname, String sanbaemanName, String imageUrl, Long fileId) {
            this.matchsId = matchsId;
            this.nickname = nickname;
            this.sanbaemanName = sanbaemanName;
            this.imageUrl = imageUrl;
            this.fileId = fileId;
        }
    }
}
