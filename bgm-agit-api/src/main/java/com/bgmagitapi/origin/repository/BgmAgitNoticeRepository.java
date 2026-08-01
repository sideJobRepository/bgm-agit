package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitNotice;
import com.bgmagitapi.origin.repository.custom.BgmAgitNoticeCostomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitNoticeRepository extends JpaRepository<BgmAgitNotice, Long> , BgmAgitNoticeCostomRepository {
}
