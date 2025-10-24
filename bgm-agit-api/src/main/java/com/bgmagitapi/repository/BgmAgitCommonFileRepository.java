package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.repository.custom.BgmAgitCommonFileCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitCommonFileRepository extends JpaRepository<BgmAgitCommonFile, Long> , BgmAgitCommonFileCustomRepository {
}
