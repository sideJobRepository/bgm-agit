package com.bgmagitapi.kml.yakamantype.repository.impl;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.QBgmAgitMember;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.kml.setting.entity.QSetting;
import com.bgmagitapi.kml.setting.entity.Setting;
import com.bgmagitapi.kml.yakamantype.repository.query.YakumanTypeQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.*;
import static com.bgmagitapi.kml.setting.entity.QSetting.*;

@RequiredArgsConstructor
public class YakumanTypeRepositoryImpl implements YakumanTypeQueryRepository {

    private final JPAQueryFactory queryFactory;


    @Override
    public List<BgmAgitMember> getMembers() {
        return queryFactory
                .selectFrom(bgmAgitMember)
                .where(
                        bgmAgitMember.socialType.eq(BgmAgitSocialType.MAHJONG),
                        bgmAgitMember.bgmAgitMemberMahjongUseStatus.eq("Y")
                )
                .fetch();
    }
    
    @Override
    public Setting getSetting() {
        return queryFactory
                .selectFrom(setting)
                .where(setting.useStatus.eq("Y"))
                .fetchFirst();
    }
}
