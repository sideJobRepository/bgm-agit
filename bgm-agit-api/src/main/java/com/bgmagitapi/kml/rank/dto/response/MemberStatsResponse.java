package com.bgmagitapi.kml.rank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberStatsResponse {

    private Long memberId;
    private String memberNickname;

    private Cards cards;
    private List<SeatRankBlock> seatStats;
    private List<TopRival> topRivals;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Cards {
        private long totalCount;
        private double avgRank;
        private long firstCount;
        private double firstRate;
        private long fourthCount;
        private double fourthRate;
        private long tobiCount;
        private double tobiRate;
        private long plusCount;
        private double plusRate;
        private long minus2Count;
        private double minus2Rate;
        private double sumPoint;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatRankBlock {
        private String wind;
        private long totalGames;
        private List<SeatRankRow> rows;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatRankRow {
        private String label;
        private long all;
        private long east;
        private long south;
        private long west;
        private long north;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopRival {
        private Long memberId;
        private String memberNickname;
        private long playedCount;
    }
}
