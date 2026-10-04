package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.entity.BgmAgitServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BgmAgitServiceRequestCustomRepository {

    Page<BgmAgitServiceRequest> findServiceRequests(Pageable pageable, String titleOrCont);

    List<BgmAgitServiceRequest> findByDetailServiceRequest(Long id);

    Long deleteByServiceRequest(Long id);
}
