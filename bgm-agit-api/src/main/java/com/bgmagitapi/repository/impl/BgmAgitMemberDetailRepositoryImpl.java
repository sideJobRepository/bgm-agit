package com.bgmagitapi.repository.impl;

import com.bgmagitapi.entity.BgmAgitRole;
import com.bgmagitapi.entity.QBgmAgitMember;
import com.bgmagitapi.entity.QBgmAgitMemberRole;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitMember.*;
import static com.bgmagitapi.entity.QBgmAgitMemberRole.*;
import static com.bgmagitapi.entity.QBgmAgitRole.bgmAgitRole;

@Repository
@RequiredArgsConstructor
public class BgmAgitMemberDetailRepositoryImpl {
    
    
    private final JPAQueryFactory queryFactory;
    
    
    public BgmAgitRole findByBgmAgitRoleName(String roleName) {
         return queryFactory
                .selectFrom(bgmAgitRole)
                .where(bgmAgitRole.bgmAgitRoleName.eq(roleName))
                .fetchOne();
    }
    
    public List<String> getRoleName(Long id){
        return queryFactory
                .select(bgmAgitRole.bgmAgitRoleName)
                .from(bgmAgitMemberRole)
                .join(bgmAgitMemberRole.bgmAgitMember,bgmAgitMember)
                .join(bgmAgitMemberRole.bgmAgitRole , bgmAgitRole)
                .where(bgmAgitMemberRole.bgmAgitMember.bgmAgitMemberId.eq(id))
                .fetch();
    }
    
}
