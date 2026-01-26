package com.bgmagitapi.kml.setting.repository.impl;

import com.bgmagitapi.kml.setting.entity.Setting;
import com.bgmagitapi.kml.setting.repository.query.SettingQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import static com.bgmagitapi.kml.setting.entity.QSetting.setting;

@RequiredArgsConstructor
public class SettingRepositoryImpl implements SettingQueryRepository {

    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Setting findBySetting() {
        return queryFactory
                .selectFrom(setting)
                .where(setting.useStatus.eq("Y"))
                .fetchFirst();
    }
}
