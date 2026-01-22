package com.bgmagitapi.kml.rule.repository.impl;

import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.rule.repository.query.RuleQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonFile.bgmAgitCommonFile;

@RequiredArgsConstructor
public class RuleRepositoryImpl implements RuleQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<BgmAgitCommonFile> getRuleFiles() {
        return queryFactory
                .selectFrom(bgmAgitCommonFile)
                .where(bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.RULE))
                .fetch();
    }
    
    @Override
    public BgmAgitCommonFile getRuleFile(Long id) {
        return queryFactory
                .selectFrom(bgmAgitCommonFile)
                .where(bgmAgitCommonFile.bgmAgitCommonFileTargetId.eq(id)
                        ,bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.RULE))
                .fetchOne();
    }
}
