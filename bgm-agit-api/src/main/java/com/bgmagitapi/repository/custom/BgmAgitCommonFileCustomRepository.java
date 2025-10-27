package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitCommonFile;

import java.util.List;

public interface BgmAgitCommonFileCustomRepository {
    List<BgmAgitCommonFile> findByUUID(List<String> deletedFiles);
    Long removeFiles(List<String> uuidList);
    
    List<BgmAgitCommonFile> findByDeleteFile(Long id);
    
}
