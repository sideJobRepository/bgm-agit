package com.bgmagitapi.kml.tournamentsetting.repository.impl;

import com.bgmagitapi.kml.tournamentsetting.entity.TournamentSetting;
import com.bgmagitapi.kml.tournamentsetting.repository.query.TournamentSettingQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import static com.bgmagitapi.kml.tournamentsetting.entity.QTournamentSetting.tournamentSetting;

@RequiredArgsConstructor
public class TournamentSettingRepositoryImpl implements TournamentSettingQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public TournamentSetting findByTournamentSetting() {
        return queryFactory
                .selectFrom(tournamentSetting)
                .where(tournamentSetting.useStatus.eq("Y"))
                .fetchFirst();
    }

    @Override
    public void updateUseStatusN() {
        queryFactory
                .update(tournamentSetting)
                .set(tournamentSetting.useStatus, "N")
                .execute();
    }
}
