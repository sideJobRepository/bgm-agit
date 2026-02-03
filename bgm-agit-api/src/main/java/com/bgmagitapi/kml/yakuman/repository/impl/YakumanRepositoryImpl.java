package com.bgmagitapi.kml.yakuman.repository.impl;

import com.bgmagitapi.entity.QBgmAgitMember;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.record.dto.response.QRecordGetDetailResponse_YakumanList;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.yakuman.repository.query.YakumanQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonFile.bgmAgitCommonFile;
import static com.bgmagitapi.entity.QBgmAgitMember.*;
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
}
