package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitNotice;
import com.bgmagitapi.repository.costom.BgmAgitNoticeCostomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitNoticeRepository extends JpaRepository<BgmAgitNotice, Long> , BgmAgitNoticeCostomRepository {
}
