package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitCommonFile;
import com.bgmagitapi.origin.repository.custom.BgmAgitCommonFileCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitCommonFileRepository extends JpaRepository<BgmAgitCommonFile, Long> , BgmAgitCommonFileCustomRepository {
}
