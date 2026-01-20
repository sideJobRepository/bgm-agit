package com.bgmagitapi.repository.impl;

import com.bgmagitapi.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.controller.response.QBgmAgitMyPageGetResponse;
import com.bgmagitapi.repository.custom.BgmAgitMemberCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import static com.bgmagitapi.entity.QBgmAgitMember.bgmAgitMember;

@RequiredArgsConstructor
public class BgmAgitMemberRepositoryImpl implements BgmAgitMemberCustomRepository {

    private final JPAQueryFactory  queryFactory;
    
    @Override
    public BgmAgitMyPageGetResponse findByMyPage(Long id) {
        return queryFactory
                .select(
                        new QBgmAgitMyPageGetResponse(
                                bgmAgitMember.bgmAgitMemberId,
                                bgmAgitMember.bgmAgitMemberEmail,
                                bgmAgitMember.bgmAgitMemberName,
                                bgmAgitMember.bgmAgitMemberNickname,
                                bgmAgitMember.bgmAgitMemberPhoneNo,
                                bgmAgitMember.bgmAgitMemberNicknameUseStatus,
                                bgmAgitMember.bgmAgitMemberMahjongUseStatus,
                                bgmAgitMember.registDate
                        )
                )
                .from(bgmAgitMember)
                .where(bgmAgitMember.bgmAgitMemberId.eq(id))
                .fetchFirst();
    }
}
