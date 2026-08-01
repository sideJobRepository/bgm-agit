package com.bgmagitapi.origin.repository.impl;

import com.bgmagitapi.origin.controller.response.BgmAgitMyPageGetResponse;
import com.bgmagitapi.origin.controller.response.QBgmAgitMyPageGetResponse;
import com.bgmagitapi.origin.repository.custom.BgmAgitMemberCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import static com.bgmagitapi.origin.entity.QBgmAgitMember.bgmAgitMember;

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
                                bgmAgitMember.bgmAgitMemberAlimtalkStatus,
                                bgmAgitMember.bgmAgitMemberMahjongUseStatus,
                                bgmAgitMember.registDate
                        )
                )
                .from(bgmAgitMember)
                .where(bgmAgitMember.bgmAgitMemberId.eq(id))
                .fetchFirst();
    }
}
