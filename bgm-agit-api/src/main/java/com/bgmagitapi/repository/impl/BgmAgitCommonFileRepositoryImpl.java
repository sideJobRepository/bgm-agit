package com.bgmagitapi.repository.impl;

import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;
import com.bgmagitapi.repository.custom.BgmAgitCommonFileCustomRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bgmagitapi.entity.QBgmAgitCommonFile.bgmAgitCommonFile;

@RequiredArgsConstructor
public class BgmAgitCommonFileRepositoryImpl implements BgmAgitCommonFileCustomRepository {
    
    private final JPAQueryFactory queryFactory;
    private final EntityManager em;
    @Override
    public List<BgmAgitCommonFile> findByUUID(List<String> deletedFiles) {
        return queryFactory
                .selectFrom(bgmAgitCommonFile)
                .where(bgmAgitCommonFile.bgmAgitCommonFileUuidName.in(deletedFiles))
                .fetch();
    }
    
    @Override
    public Long removeFiles(List<String> uuidList) {
        em.flush();
        long execute = queryFactory
                .delete(bgmAgitCommonFile)
                .where(bgmAgitCommonFile.bgmAgitCommonFileUuidName.in(uuidList))
                .execute();
        em.clear();
        return execute;
    }
    
    @Override
    public List<BgmAgitCommonFile> findByDeleteFile(Long id) {
         return queryFactory
                .select(bgmAgitCommonFile)
                .from(bgmAgitCommonFile)
                .where(bgmAgitCommonFile.bgmAgitCommonFileTargetId.eq(id),
                        bgmAgitCommonFile.bgmAgitCommonFileType.eq(BgmAgitCommonType.FREE)
                        )
                .fetch();
    }
}
