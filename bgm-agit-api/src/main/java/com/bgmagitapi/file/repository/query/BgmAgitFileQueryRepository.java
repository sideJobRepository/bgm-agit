package com.bgmagitapi.file.repository.query;

import com.bgmagitapi.file.entity.BgmAgitFile;
import com.bgmagitapi.file.enums.FileType;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface BgmAgitFileQueryRepository {

    List<BgmAgitFile> findFilesIds(List<Long> ids);

    List<BgmAgitFile> findTemporaryFilesBefore(LocalDateTime targetTime);

    List<BgmAgitFile> findByTargetIdAndFileType(Long targetId, FileType fileType);

    List<BgmAgitFile> findByTargetIdsAndFileType(List<Long> targetIds, FileType fileType);

    List<BgmAgitFile> findByPathsAndFileType(Collection<String> paths, FileType fileType);
}
