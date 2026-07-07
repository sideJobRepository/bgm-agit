package com.bgmagitapi.kml.sanbaeman.repository.impl;

import com.bgmagitapi.origin.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.origin.entity.enumeration.BgmAgitSocialType;
import com.bgmagitapi.origin.file.enums.FileStatus;
import com.bgmagitapi.origin.file.enums.FileType;
import com.bgmagitapi.kml.record.dto.response.QRecordGetDetailResponse_SanbaemanList;
import com.bgmagitapi.kml.record.dto.response.QRecordGetResponse_SanbaemanInfo;
import com.bgmagitapi.kml.record.dto.response.RecordGetDetailResponse;
import com.bgmagitapi.kml.record.dto.response.RecordGetResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.QSanbaemanDetailGetResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.QSanbaemanPivotResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanDetailGetResponse;
import com.bgmagitapi.kml.sanbaeman.dto.response.SanbaemanPivotResponse;
import com.bgmagitapi.kml.sanbaeman.entity.Sanbaeman;
import com.bgmagitapi.kml.sanbaeman.repository.query.SanbaemanQueryRepository;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bgmagitapi.origin.entity.QBgmAgitCommonFile.bgmAgitCommonFile;
import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;
import static com.bgmagitapi.origin.file.entity.QBgmAgitFile.bgmAgitFile;
import static com.bgmagitapi.kml.sanbaeman.entity.QSanbaeman.sanbaeman;

@RequiredArgsConstructor
public class SanbaemanRepositoryImpl implements SanbaemanQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<RecordGetDetailResponse.SanbaemanList> findByMatchsSanbaeman(Long id) {
        return queryFactory
                .select(
                        new QRecordGetDetailResponse_SanbaemanList(
                                sanbaeman.id,
                                bgmAgitMember.bgmAgitMemberId,
                                bgmAgitMember.bgmAgitMemberNickname,
                                sanbaeman.sanbaemanName,
                                sanbaeman.sanbaemanCont,
                                bgmAgitCommonFile.bgmAgitCommonFileUrl,
                                bgmAgitFile.id
                        )
                )
                .from(sanbaeman)
                .leftJoin(bgmAgitCommonFile)
                .on(sanbaeman.id.eq(bgmAgitCommonFile.bgmAgitCommonFileTargetId), bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.SANBAEMAN))
                .leftJoin(bgmAgitFile)
                .on(sanbaeman.id.eq(bgmAgitFile.targetId),
                        bgmAgitFile.fileType.eq(FileType.SANBAEMAN),
                        bgmAgitFile.fileStatus.eq(FileStatus.COMPLETE))
                .leftJoin(sanbaeman.member, bgmAgitMember)
                .where(sanbaeman.matchs.id.eq(id))
                .fetch();
    }

    @Override
    public List<RecordGetResponse.SanbaemanInfo> findByMatchsIds(List<Long> matchsIds) {
        if (matchsIds == null || matchsIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return queryFactory
                .select(
                        new QRecordGetResponse_SanbaemanInfo(
                                sanbaeman.matchs.id,
                                bgmAgitMember.bgmAgitMemberNickname,
                                sanbaeman.sanbaemanName,
                                bgmAgitCommonFile.bgmAgitCommonFileUrl,
                                bgmAgitFile.id
                        )
                )
                .from(sanbaeman)
                .leftJoin(bgmAgitCommonFile)
                .on(sanbaeman.id.eq(bgmAgitCommonFile.bgmAgitCommonFileTargetId), bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.SANBAEMAN))
                .leftJoin(bgmAgitFile)
                .on(sanbaeman.id.eq(bgmAgitFile.targetId),
                        bgmAgitFile.fileType.eq(FileType.SANBAEMAN),
                        bgmAgitFile.fileStatus.eq(FileStatus.COMPLETE))
                .leftJoin(sanbaeman.member, bgmAgitMember)
                .where(sanbaeman.matchs.id.in(matchsIds))
                .fetch();
    }

    @Override
    public List<Sanbaeman> findBySanbaemanMatchesId(Long matchsId) {
        return queryFactory
                .selectFrom(sanbaeman)
                .where(sanbaeman.matchs.id.eq(matchsId))
                .fetch();
    }

    @Override
    public Page<SanbaemanPivotResponse> getPivotSanbaeman(String nickName, Pageable pageable) {

        List<SanbaemanPivotResponse> content = queryFactory
                .select(new QSanbaemanPivotResponse(
                        bgmAgitMember.bgmAgitMemberId,
                        bgmAgitMember.bgmAgitMemberNickname,
                        sanbaeman.count()
                ))
                .from(bgmAgitMember)
                .leftJoin(sanbaeman)
                .on(
                        sanbaeman.member.bgmAgitMemberId.eq(bgmAgitMember.bgmAgitMemberId),
                        // 삭제된 대국에 속한 삼배만은 집계에서 제외
                        sanbaeman.matchs.delStatus.ne("Y")
                )
                .where(bgmAgitMember.socialType.eq(BgmAgitSocialType.MAHJONG), whereNickName(nickName))
                .groupBy(bgmAgitMember.bgmAgitMemberId, bgmAgitMember.bgmAgitMemberNickname)
                .orderBy(sanbaeman.count().desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(bgmAgitMember.count())
                .from(bgmAgitMember)
                .where(bgmAgitMember.socialType.eq(BgmAgitSocialType.MAHJONG), whereNickName(nickName));

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public Page<SanbaemanDetailGetResponse> getSanbaeman(Pageable pageable) {

        // 1) 페이지에 해당하는 sanbaeman id만 먼저 가져오기 (삭제된 대국 제외)
        List<Long> ids = queryFactory
                .select(sanbaeman.id)
                .from(sanbaeman)
                .where(sanbaeman.matchs.delStatus.ne("Y"))
                .orderBy(sanbaeman.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        if (ids.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        JPAQuery<Long> countQuery = queryFactory
                .select(sanbaeman.count())
                .from(sanbaeman)
                .where(sanbaeman.matchs.delStatus.ne("Y"));

        List<SanbaemanDetailGetResponse> content = queryFactory
                .select(new QSanbaemanDetailGetResponse(
                        bgmAgitMember.bgmAgitMemberNickname,
                        sanbaeman.sanbaemanName,
                        sanbaeman.sanbaemanCont,
                        bgmAgitCommonFile.bgmAgitCommonFileUrl,
                        bgmAgitFile.id,
                        sanbaeman.matchs.id,
                        sanbaeman.registDate
                ))
                .from(sanbaeman)
                .join(sanbaeman.member, bgmAgitMember)
                .leftJoin(bgmAgitCommonFile)
                .on(
                        bgmAgitCommonFile.bgmAgitCommonFileTargetId.eq(sanbaeman.id),
                        bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.SANBAEMAN)
                )
                .leftJoin(bgmAgitFile)
                .on(
                        bgmAgitFile.targetId.eq(sanbaeman.id),
                        bgmAgitFile.fileType.eq(FileType.SANBAEMAN),
                        bgmAgitFile.fileStatus.eq(FileStatus.COMPLETE)
                )
                .where(sanbaeman.id.in(ids))
                .orderBy(sanbaeman.id.desc())
                .fetch();

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    private BooleanExpression whereNickName(String nickName) {
        if (!StringUtils.hasText(nickName)) {
            return null;
        }
        return bgmAgitMember.bgmAgitMemberNickname.like("%" + nickName + "%");
    }
}
