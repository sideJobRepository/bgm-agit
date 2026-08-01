package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitInquiry;
import com.bgmagitapi.origin.repository.custom.BgmAgitInquiryCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitInquiryRepository extends JpaRepository<BgmAgitInquiry, Long>, BgmAgitInquiryCustomRepository {
}
