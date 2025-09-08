package com.bgmagitapi.repository.impl;

import com.bgmagitapi.repository.costom.BgmAgitBiztalkTokenCustomRepository;
import com.bgmagitapi.service.response.BizTalkTokenResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import static com.bgmagitapi.entity.QBgmAgitBiztalkToken.bgmAgitBiztalkToken;

@RequiredArgsConstructor
public class BgmAgitBiztalkTokenRepositoryImpl implements BgmAgitBiztalkTokenCustomRepository {
    
    private final JPAQueryFactory queryFactory;
    
    private final EntityManager em;
    
    @Override
    @Transactional
    public long deleteIp(String bgmAgitBiztalkIp) {
        em.flush();
        long execute = queryFactory
                .delete(bgmAgitBiztalkToken)
                .where(bgmAgitBiztalkToken.bgmAgitBiztalkIp.eq(bgmAgitBiztalkIp))
                .execute();
         em.clear();
        return execute;
    }
    
    @Override
    public BizTalkTokenResponse getBizTalkToken(String publicIp) {
        return queryFactory
                .select(Projections.constructor(
                        BizTalkTokenResponse.class,
                        bgmAgitBiztalkToken.bgmAgitBiztalkTokenValue,
                        Expressions.stringTemplate(
                                "DATE_FORMAT({0}, {1})",
                                bgmAgitBiztalkToken.bgmAgitBiztalkTokenExpiresDate,
                                Expressions.constant("%Y%m%d%H%i%s")
                        )
                ))
                .from(bgmAgitBiztalkToken)
                .where(
                        bgmAgitBiztalkToken.bgmAgitBiztalkIp.eq(publicIp)
                ).fetchOne();
    }
}
