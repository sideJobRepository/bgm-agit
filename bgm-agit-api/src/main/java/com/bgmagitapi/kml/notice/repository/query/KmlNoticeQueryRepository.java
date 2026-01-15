package com.bgmagitapi.kml.notice.repository.query;

import com.bgmagitapi.kml.menu.dto.response.KmlMenuGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface KmlNoticeQueryRepository {
    Page<KmlMenuGetResponse> findByKmlNotce(Pageable pageable);
}
