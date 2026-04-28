package com.bgmagitapi.file.repository;

import com.bgmagitapi.file.entity.BgmAgitFile;
import com.bgmagitapi.file.repository.query.BgmAgitFileQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitFileRepository
        extends JpaRepository<BgmAgitFile, Long>, BgmAgitFileQueryRepository {
}
