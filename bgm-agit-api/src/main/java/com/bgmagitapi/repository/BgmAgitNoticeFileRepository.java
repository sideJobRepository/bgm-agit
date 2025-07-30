package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitNoticeFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BgmAgitNoticeFileRepository extends JpaRepository<BgmAgitNoticeFile, Long> {
    
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM BgmAgitNoticeFile a WHERE a.bgmAgitNoticeFileUuidName in :uuidList")
    int removeFiles(List<String> uuidList);
    
    @Query("SELECT a FROM BgmAgitNoticeFile a WHERE a.bgmAgitNoticeFileUuidName in :uuidList")
    List<BgmAgitNoticeFile> findByUUID(List<String> uuidList);
    
}
