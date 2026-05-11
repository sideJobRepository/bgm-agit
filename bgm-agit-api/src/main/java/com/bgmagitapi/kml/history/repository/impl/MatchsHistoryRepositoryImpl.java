package com.bgmagitapi.kml.history.repository.impl;

import com.bgmagitapi.entity.QBgmAgitMember;
import com.bgmagitapi.kml.history.dto.MatchsAndRecordHistoryResponse;
import com.bgmagitapi.kml.history.dto.QMatchsAndRecordHistoryResponse;
import com.bgmagitapi.kml.history.dto.QMatchsAndRecordHistoryResponse_RecordHistList;
import com.bgmagitapi.kml.history.repository.query.MatchsHistoryQueryRepository;
import com.querydsl.core.group.GroupBy;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.kml.history.entity.QMatchsHistory.matchsHistory;
import static com.bgmagitapi.kml.history.entity.QRecordHistory.recordHistory;
import static com.bgmagitapi.kml.setting.entity.QSetting.setting;
import static com.bgmagitapi.kml.tournament.entity.QTournament.tournament;
import static com.bgmagitapi.kml.tournamentsetting.entity.QTournamentSetting.tournamentSetting;

@RequiredArgsConstructor
public class MatchsHistoryRepositoryImpl implements MatchsHistoryQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<MatchsAndRecordHistoryResponse> findByHistory(Long matchsId) {
        
        QBgmAgitMember modifyMember = new QBgmAgitMember("modifyMember");
        QBgmAgitMember playerMember = new QBgmAgitMember("playerMember");
        
        return queryFactory
                .from(recordHistory)
                .join(recordHistory.matchsHistory, matchsHistory)
                .join(modifyMember).on(matchsHistory.memberId.eq(modifyMember.bgmAgitMemberId))
                .join(playerMember).on(recordHistory.memberId.eq(playerMember.bgmAgitMemberId))
                .join(setting).on(matchsHistory.settingId.eq(setting.id))
                .leftJoin(tournament).on(matchsHistory.tournamentId.eq(tournament.id))
                .leftJoin(tournamentSetting).on(tournament.tournamentSetting.id.eq(tournamentSetting.id))
                .where(matchsHistory.matchsId.eq(matchsId))
                .transform(
                        GroupBy.groupBy(matchsHistory.id).list(
                                new QMatchsAndRecordHistoryResponse(
                                        matchsHistory.id,
                                        matchsHistory.matchsId,
                                        Expressions.numberTemplate(Integer.class, "COALESCE({0}, {1})", tournamentSetting.turning, setting.turning),
                                        Expressions.numberTemplate(Double.class, "COALESCE({0}, {1})", tournamentSetting.firstUma, setting.firstUma),
                                        Expressions.numberTemplate(Double.class, "COALESCE({0}, {1})", tournamentSetting.secondUma, setting.secondUma),
                                        Expressions.numberTemplate(Double.class, "COALESCE({0}, {1})", tournamentSetting.thirdUma, setting.thirdUma),
                                        Expressions.numberTemplate(Double.class, "COALESCE({0}, {1})", tournamentSetting.fourUma, setting.fourUma),
                                        matchsHistory.wind,
                                        matchsHistory.tournamentStatus,
                                        matchsHistory.delStatus,
                                        matchsHistory.changeType,
                                        matchsHistory.changeReason,
                                        matchsHistory.modifyDate,
                                        modifyMember.bgmAgitMemberNickname,
                                        GroupBy.list(
                                                new QMatchsAndRecordHistoryResponse_RecordHistList(
                                                        recordHistory.recordId,
                                                        playerMember.bgmAgitMemberNickname,
                                                        recordHistory.recordScore,
                                                        recordHistory.recordRank,
                                                        recordHistory.recordPoint,
                                                        recordHistory.recordSeat,
                                                        new CaseBuilder()
                                                                .when(recordHistory.recordRank.eq(1)).then(true)
                                                                .otherwise(false)
                                                )
                                        )
                                )
                        )
                );
        
        
    }
}
