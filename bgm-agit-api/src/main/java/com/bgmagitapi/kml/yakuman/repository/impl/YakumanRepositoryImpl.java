package com.bgmagitapi.kml.yakuman.repository.impl;

import com.bgmagitapi.entity.QBgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.record.dto.response.QRecordGetDetailResponse_YakumanList;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.yakuman.dto.response.QYakumanGetResponse;
import com.bgmagitapi.kml.yakuman.dto.response.YakumanGetResponse;
import com.bgmagitapi.kml.yakuman.entity.Yakuman;
import com.bgmagitapi.kml.yakuman.repository.query.YakumanQueryRepository;
import com.querydsl.core.types.Ops;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonFile.bgmAgitCommonFile;
import static com.bgmagitapi.entity.QBgmAgitMember.*;
import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.kml.yakuman.entity.QYakuman.yakuman;

@RequiredArgsConstructor
public class YakumanRepositoryImpl implements YakumanQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<RecordGetDetailResponse.YakumanList> findByMatchsYakuman(Long id) {
        return queryFactory
                .select(
                        new QRecordGetDetailResponse_YakumanList(
                                yakuman.id,
                                bgmAgitMember.bgmAgitMemberId,
                                bgmAgitMember.bgmAgitMemberNickname,
                                yakuman.yakumanName,
                                yakuman.yakumanCont,
                                bgmAgitCommonFile.bgmAgitCommonFileUrl
                        )
                )
                .from(yakuman)
                .leftJoin(bgmAgitCommonFile)
                .on(yakuman.id.eq(bgmAgitCommonFile.bgmAgitCommonFileTargetId), bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.YAKUMAN))
                .leftJoin(yakuman.member,bgmAgitMember)
                .where(yakuman.matchs.id.eq(id))
                .fetch();
    }
    
    @Override
    public List<Yakuman> findByYakumanMatchesId(Long matchsId) {
        return queryFactory
                .selectFrom(yakuman)
                .where(yakuman.matchs.id.eq(matchsId))
                .fetch();
    }
    
    @Override
    public List<YakumanGetResponse> getPivotYakuman() {
        NumberExpression<Long> countedYakuman = sumCase(yakuman.yakumanName.eq("헤아림 역만"));
        NumberExpression<Long> suuankou       = sumCase(yakuman.yakumanName.eq("사암각"));
        NumberExpression<Long> suukantsu      = sumCase(yakuman.yakumanName.eq("사깡즈"));
        NumberExpression<Long> kokushiMusou   = sumCase(yakuman.yakumanName.eq("국사국쌍"));
        NumberExpression<Long> daisangen      = sumCase(yakuman.yakumanName.eq("대삼원"));
        NumberExpression<Long> tenhou         = sumCase(yakuman.yakumanName.eq("천화"));
        NumberExpression<Long> chiihou        = sumCase(yakuman.yakumanName.eq("지화"));
        NumberExpression<Long> chuurenPoutou  = sumCase(yakuman.yakumanName.eq("구련보등"));
        NumberExpression<Long> ryuuiisou      = sumCase(yakuman.yakumanName.eq("녹일색"));
        NumberExpression<Long> chinroutou     = sumCase(yakuman.yakumanName.eq("청노두"));
        NumberExpression<Long> tsuuiisou      = sumCase(yakuman.yakumanName.eq("자일색"));
        NumberExpression<Long> shousuushii    = sumCase(yakuman.yakumanName.eq("소사희"));
        NumberExpression<Long> daisuushii     = sumCase(yakuman.yakumanName.eq("대사희"));
        NumberExpression<Long> kokushi13Wait  = sumCase(yakuman.yakumanName.eq("국사무쌍 13면 대기"));
        NumberExpression<Long> pureChuuren    = sumCase(yakuman.yakumanName.eq("순정 구련보등"));
        NumberExpression<Long> suuankouTanki  = sumCase(yakuman.yakumanName.eq("사암각 단기"));
        NumberExpression<Long> sharin         = sumCase(yakuman.yakumanName.eq("사리엔커"));
        
        return queryFactory
                .select(new QYakumanGetResponse(
                        bgmAgitMember.bgmAgitMemberId,          // memberId
                        bgmAgitMember.bgmAgitMemberNickname,    // nickname
                        yakuman.count(),                 // totalCount
                        countedYakuman,
                        suuankou,
                        suukantsu,
                        kokushiMusou,
                        daisangen,
                        tenhou,
                        chiihou,
                        chuurenPoutou,
                        ryuuiisou,
                        chinroutou,
                        tsuuiisou,
                        shousuushii,
                        daisuushii,
                        kokushi13Wait,
                        pureChuuren,
                        suuankouTanki,
                        sharin
                ))
                .from(bgmAgitMember)
                .leftJoin(yakuman)
                .on(yakuman.member.bgmAgitMemberId.eq(bgmAgitMember.bgmAgitMemberId))
                .where(bgmAgitMember.bgmAgitMemberMahjongUseStatus.eq("Y"))
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .orderBy(yakuman.count().desc())
                .fetch();
    }
    private NumberExpression<Long> sumCase(BooleanExpression cond) {
        return Expressions.numberOperation(Long.class, Ops.AggOps.SUM_AGG, new CaseBuilder().when(cond).then(1L).otherwise(0L));
    }
}
