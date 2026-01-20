package com.bgmagitapi.kml.yakamantype.repository.impl;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.QBgmAgitMember;
import com.bgmagitapi.kml.yakamantype.repository.query.YakumanTypeQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.*;

@RequiredArgsConstructor
public class YakumanTypeRepositoryImpl implements YakumanTypeQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    
    @Override
    public List<BgmAgitMember> getMembers() {
        return queryFactory
                .selectFrom(bgmAgitMember)
                .where(bgmAgitMember.bgmAgitMemberMahjongUseStatus.eq("Y"))
                .fetch();
    }
}
