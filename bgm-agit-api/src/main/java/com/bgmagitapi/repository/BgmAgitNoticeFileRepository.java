package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitNoticeFile;
import com.bgmagitapi.repository.costom.BgmAgitNoticeFileCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BgmAgitNoticeFileRepository extends JpaRepository<BgmAgitNoticeFile, Long>  , BgmAgitNoticeFileCustomRepository {
    

    @Query("SELECT a FROM BgmAgitNoticeFile a WHERE a.bgmAgitNoticeFileUuidName in :uuidList")
    List<BgmAgitNoticeFile> findByUUID(List<String> uuidList);
    
}
