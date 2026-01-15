package com.bgmagitapi.kml.notice.repository.query;

import com.bgmagitapi.entity.BgmAgitCommonFile;
import com.bgmagitapi.kml.notice.dto.response.KmlNoticeGetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface KmlNoticeQueryRepository {
    Page<KmlNoticeGetResponse> findByKmlNotice(Pageable pageable);
    List<BgmAgitCommonFile> findByKmlNoticeFiles(List<Long> noticeIds);
}
