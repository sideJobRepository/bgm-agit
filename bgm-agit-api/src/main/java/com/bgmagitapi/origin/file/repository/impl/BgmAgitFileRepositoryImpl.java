package com.bgmagitapi.origin.file.repository.impl;

import com.bgmagitapi.origin.file.entity.BgmAgitFile;
import com.bgmagitapi.origin.file.enums.FileStatus;
import com.bgmagitapi.origin.file.enums.FileType;
import com.bgmagitapi.origin.file.repository.query.BgmAgitFileQueryRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import static com.bgmagitapi.origin.file.entity.QBgmAgitFile.bgmAgitFile;

@RequiredArgsConstructor
public class BgmAgitFileRepositoryImpl implements BgmAgitFileQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<BgmAgitFile> findFilesIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return queryFactory
                .selectFrom(bgmAgitFile)
                .where(bgmAgitFile.id.in(ids))
                .fetch();
    }

    @Override
    public List<BgmAgitFile> findTemporaryFilesBefore(LocalDateTime targetTime) {
        return queryFactory
                .selectFrom(bgmAgitFile)
                .where(bgmAgitFile.fileStatus.eq(FileStatus.TEMPORARY)
                        .and(bgmAgitFile.modifyDate.lt(targetTime)))
                .fetch();
    }

    @Override
    public List<BgmAgitFile> findByTargetIdAndFileType(Long targetId, FileType fileType) {
        return queryFactory
                .selectFrom(bgmAgitFile)
                .where(bgmAgitFile.targetId.eq(targetId)
                        .and(bgmAgitFile.fileType.eq(fileType))
                        .and(bgmAgitFile.fileStatus.eq(FileStatus.COMPLETE)))
                .fetch();
    }

    @Override
    public List<BgmAgitFile> findByTargetIdsAndFileType(List<Long> targetIds, FileType fileType) {
        if (targetIds == null || targetIds.isEmpty()) return List.of();
        return queryFactory
                .selectFrom(bgmAgitFile)
                .where(bgmAgitFile.targetId.in(targetIds)
                        .and(bgmAgitFile.fileType.eq(fileType))
                        .and(bgmAgitFile.fileStatus.eq(FileStatus.COMPLETE)))
                .fetch();
    }

    @Override
    public List<BgmAgitFile> findByPathsAndFileType(Collection<String> paths, FileType fileType) {
        if (paths == null || paths.isEmpty()) return List.of();
        return queryFactory
                .selectFrom(bgmAgitFile)
                .where(bgmAgitFile.filePath.in(paths)
                        .and(bgmAgitFile.fileType.eq(fileType)))
                .fetch();
    }

    @Override
    public List<BgmAgitFile> findTemporaryByTargetIdsAndFileType(List<Long> targetIds, FileType fileType) {
        if (targetIds == null || targetIds.isEmpty()) return List.of();
        return queryFactory
                .selectFrom(bgmAgitFile)
                .where(bgmAgitFile.targetId.in(targetIds)
                        .and(bgmAgitFile.fileType.eq(fileType))
                        .and(bgmAgitFile.fileStatus.eq(FileStatus.TEMPORARY)))
                .fetch();
    }
}
