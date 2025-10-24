package com.bgmagitapi.repository.custom;

import com.bgmagitapi.entity.BgmAgitNoticeFile;

import java.util.List;

public interface BgmAgitNoticeFileCustomRepository {
    
    long removeFiles(List<String> uuidList);
    
    List<BgmAgitNoticeFile> findByUUID(List<String> uuidList);
}
