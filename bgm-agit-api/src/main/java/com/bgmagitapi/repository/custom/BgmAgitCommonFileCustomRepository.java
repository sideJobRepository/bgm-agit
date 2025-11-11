package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.entity.enumeration.BgmAgitCommonType;

import java.util.List;

public interface BgmAgitCommonFileCustomRepository {
    List<BgmAgitCommonFile> findByIds(List<Long> deletedFiles);
    Long removeFiles(List<Long> fileIds);
    
    List<BgmAgitCommonFile> findByDeleteFile(Long id,BgmAgitCommonType type);
    
    List<BgmAgitCommonFile> findAllByTargetIdsAndType(List<Long> targetIds, BgmAgitCommonType bgmAgitCommonType);
}
