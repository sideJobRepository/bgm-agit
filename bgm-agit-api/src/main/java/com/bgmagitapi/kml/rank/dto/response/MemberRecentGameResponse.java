package com.bgmagitapi.kml.rank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberRecentGameResponse {

    private Long matchsId;
    private LocalDateTime registDate;
    private String matchsWind;
    private String mySeat;
    private Integer myRank;
    private Integer myScore;
    private Double myPoint;
    private List<Player> players;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Player {
        private Long memberId;
        private String memberNickname;
        private String seat;
        private Integer rank;
        private Integer score;
    }
}
