package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitInquiry;
import com.bgmagitapi.repository.custom.BgmAgitInquiryCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitInquiryRepository extends JpaRepository<BgmAgitInquiry, Long>, BgmAgitInquiryCustomRepository {
}
