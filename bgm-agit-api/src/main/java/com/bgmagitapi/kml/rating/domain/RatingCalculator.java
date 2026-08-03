package com.bgmagitapi.kml.rating.domain;

import com.bgmagitapi.kml.matchs.enums.MatchsWind;
import com.bgmagitapi.kml.rating.entity.Season;
import com.bgmagitapi.kml.record.entity.Record;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * 한 판의 착순 결과로 회원별 레이팅 증감(델타)을 계산한다.
 *
 * <pre>
 * delta_i = baseScore(rank_i) × weight(wind) × m_i
 * </pre>
 *
 * <ul>
 *   <li>baseScore = 착순별 기준점수({@code firstScore~fourthScore}). weight = 게임길이 배수.
 *       (둘의 곱 = {@link Season#calculateScore})
 *   <li>m_i = 배율. 기준점수의 −30% ~ +50% 범위({@code [0.7, 1.5]})로 클램프.
 *     <pre>m_i = clamp( 1 + (recordPoint_i − 기대승점_i)/firstScore × sign(baseScore), 0.7, 1.5 )</pre>
 *     <ul>
 *       <li>recordPoint(우마오카): 크게 이길수록 배율↑
 *       <li>기대승점(4명 레이팅의 페어와이즈 Elo): 레이팅 높을수록 배율↓
 *       <li>sign(baseScore): 승패 방향 정렬. 강자가 크게 지면 페널티↑, 약자가 근소하게 지면 페널티↓
 *     </ul>
 * </ul>
 *
 * 예) 기준점수 100점 → 저레이팅이 크게 이기면 최대 150, 고레이팅이 근소하게 이기면 70 근처.
 * 산출값은 "이번 판 델타"뿐이며, 이전 레이팅 누적·바닥보호는 이 클래스 밖(서비스)의 책임이다.
 */
@RequiredArgsConstructor
public class RatingCalculator {

    // 레이팅 민감도(표준 Elo). 두 사람 레이팅 차가 이 값이면 페어와이즈 승률 약 10:1
    private static final double RATING_DIVISOR = 400.0;
    // 4인 대국 페어와이즈 기대 승수의 평균이자 최대 편차 ((n-1)/2). 기대승점 정규화 기준
    private static final double EXPECTED_WINS_MEAN = 1.5;
    // 기준점수 배율 범위 (−30% ~ +50%)
    private static final double MIN_MULTIPLIER = 0.7;
    private static final double MAX_MULTIPLIER = 1.5;

    private final Season season;

    public RatingResult calculate(RatingEntry first, RatingEntry second, RatingEntry third, RatingEntry fourth, MatchsWind wind) {
        // 1 ~ 4 등이 착순에 맞게 넘어왔는지 검증
        validateRank(first.record(), second.record(), third.record(), fourth.record());

        // 가중치 계산 (기준점수 × 게임길이배수 × 레이팅·우마오카 배율)
        List<RatingEntry> entries = List.of(first, second, third, fourth);

        // 결과 반환
        return new RatingResult(
                calculateItem(first, entries, wind),
                calculateItem(second, entries, wind),
                calculateItem(third, entries, wind),
                calculateItem(fourth, entries, wind));
    }

    private RatingResult.Item calculateItem(RatingEntry target, List<RatingEntry> entries, MatchsWind wind) {
        Record record = target.record();

        // 기준점수 × 게임길이 배수
        BigDecimal weightedBase = season.calculateScore(record.getRecordRank(), wind);

        // 우마오카(실제승점) 대비 기대승점의 차이만큼 기준점수를 [0.7, 1.5] 배율로 가감
        double surprise = actualPointOf(record) - expectedPointOf(target, entries);
        double multiplier = multiplierOf(surprise, weightedBase);

        double delta = weightedBase.doubleValue() * multiplier;
        BigDecimal ratingValue = BigDecimal.valueOf(delta).setScale(1, RoundingMode.HALF_UP);
        return new RatingResult.Item(record, ratingValue);
    }

    private double multiplierOf(double surprise, BigDecimal weightedBase) {
        double sign = Math.signum(weightedBase.doubleValue());
        double raw = 1.0 + (surprise / season.getFirstScore().doubleValue()) * sign;
        return Math.max(MIN_MULTIPLIER, Math.min(MAX_MULTIPLIER, raw));
    }

    // 레이팅으로 산출한 기대 승점. 압도적 강자면 +firstScore, 압도적 약자면 -firstScore 로 수렴
    private double expectedPointOf(RatingEntry target, List<RatingEntry> entries) {
        double targetRating = target.currentRating().doubleValue();

        double expectedWins = 0.0;
        for (RatingEntry other : entries) {
            if (other == target) {
                continue;
            }
            double ratingGap = other.currentRating().doubleValue() - targetRating;
            expectedWins += 1.0 / (1.0 + Math.pow(10, ratingGap / RATING_DIVISOR));
        }

        double normalized = (expectedWins - EXPECTED_WINS_MEAN) / EXPECTED_WINS_MEAN;
        return season.getFirstScore().doubleValue() * normalized;
    }

    private double actualPointOf(Record record) {
        Double recordPoint = record.getRecordPoint();
        if (recordPoint == null) {
            throw new IllegalArgumentException("승점(recordPoint)이 없어 레이팅을 계산할 수 없습니다. recordId=" + record.getId());
        }
        return recordPoint;
    }

    private void validateRank(Record first, Record second, Record third, Record fourth) {
        List<Record> rankedRecords = List.of(first, second, third, fourth);
        for (int rank = 1; rank <= rankedRecords.size(); rank++) {
            Integer recordRank = rankedRecords.get(rank - 1).getRecordRank();
            if (!Integer.valueOf(rank).equals(recordRank)) {
                throw new IllegalArgumentException(
                        "착순과 기록의 등수가 일치하지 않습니다. 기대 등수=" + rank + ", 실제 등수=" + recordRank);
            }
        }
    }

}
