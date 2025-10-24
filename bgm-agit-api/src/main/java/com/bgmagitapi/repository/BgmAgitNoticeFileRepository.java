package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitNoticeFile;
import com.bgmagitapi.repository.custom.BgmAgitNoticeFileCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitNoticeFileRepository extends JpaRepository<BgmAgitNoticeFile, Long>  , BgmAgitNoticeFileCustomRepository {

}
