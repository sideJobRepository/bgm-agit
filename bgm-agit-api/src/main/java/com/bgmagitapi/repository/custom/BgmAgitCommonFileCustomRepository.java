package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitCommonFile;

import java.util.List;

public interface BgmAgitCommonFileCustomRepository {
    List<BgmAgitCommonFile> findByIds(List<Long> deletedFiles);
    Long removeFiles(List<Long> fileIds);
    
    List<BgmAgitCommonFile> findByDeleteFile(Long id);
    
}
