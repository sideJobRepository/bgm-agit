package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitServiceRequest;
import com.bgmagitapi.origin.repository.custom.BgmAgitServiceRequestCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitServiceRequestRepository extends JpaRepository<BgmAgitServiceRequest, Long>, BgmAgitServiceRequestCustomRepository {
}
