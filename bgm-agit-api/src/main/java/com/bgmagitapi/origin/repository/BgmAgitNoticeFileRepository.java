package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitNoticeFile;
import com.bgmagitapi.origin.repository.custom.BgmAgitNoticeFileCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitNoticeFileRepository extends JpaRepository<BgmAgitNoticeFile, Long>  , BgmAgitNoticeFileCustomRepository {

}
