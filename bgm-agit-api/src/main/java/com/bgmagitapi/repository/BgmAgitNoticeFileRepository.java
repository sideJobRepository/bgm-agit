package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitNotice;
import com.bgmagitapi.entity.BgmAgitNoticeFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitNoticeFileRepository extends JpaRepository<BgmAgitNoticeFile, Long> {
}
