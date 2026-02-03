package com.bgmagitapi.kml.yakuman.repository.impl;

import com.bgmagitapi.entity.BgmAgitMember;
import com.bgmagitapi.entity.QBgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.kml.matchs.entity.QMatchs;
import com.bgmagitapi.kml.record.dto.response.QRecordGetDetailResponse_RecordList;
import com.bgmagitapi.kml.record.dto.response.QRecordGetDetailResponse_YakumanList;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.yakuman.entity.QYakuman;
import com.bgmagitapi.kml.yakuman.repository.query.YakumanQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonFile.*;
import static com.bgmagitapi.kml.yakuman.entity.QYakuman.*;

@RequiredArgsConstructor
public class YakumanRepositoryImpl implements YakumanQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<RecordGetDetailResponse.YakumanList> findByMatchsYakuman(Long id) {
        return queryFactory
                .select(
                        new QRecordGetDetailResponse_YakumanList(
                                yakuman.id,
                                yakuman.yakumanName,
                                yakuman.yakumanCont,
                                bgmAgitCommonFile.bgmAgitCommonFileUrl
                        )
                )
                .from(yakuman)
                .leftJoin(bgmAgitCommonFile)
                .on(yakuman.id.eq(bgmAgitCommonFile.bgmAgitCommonFileTargetId), bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.YAKUMAN))
                .where(yakuman.matchs.id.eq(id))
                .fetch();
    }
}
