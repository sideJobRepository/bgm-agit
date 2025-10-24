package com.bgmagitapi.repository.impl;

import com.bgmagitapi.entity.BgmAgitNoticeFile;
import com.bgmagitapi.repository.custom.BgmAgitNoticeFileCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitNoticeFile.bgmAgitNoticeFile;

@RequiredArgsConstructor
public class BgmAgitNoticeFileRepositoryImpl implements BgmAgitNoticeFileCustomRepository {
    
    private final JPAQueryFactory queryFactory;
    private final EntityManager em;
    
    @Override
    public long removeFiles(List<String> uuidList) {
        em.flush();
        long execute = queryFactory
                .delete(bgmAgitNoticeFile)
                .where(bgmAgitNoticeFile.bgmAgitNoticeFileUuidName.in(uuidList))
                .execute();
        em.clear();
        return execute;
    }
    
    @Override
    public List<BgmAgitNoticeFile> findByUUID(List<String> uuidList) {
        return queryFactory
                .selectFrom(bgmAgitNoticeFile)
                .where(bgmAgitNoticeFile.bgmAgitNoticeFileUuidName.in(uuidList))
                .fetch();
    }
}
