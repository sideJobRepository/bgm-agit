package com.bgmagitapi.origin.file.repository;

import com.bgmagitapi.origin.file.entity.BgmAgitFile;
import com.bgmagitapi.origin.file.repository.query.BgmAgitFileQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitFileRepository
        extends JpaRepository<BgmAgitFile, Long>, BgmAgitFileQueryRepository {
}
