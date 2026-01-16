package com.bgmagitapi.kml.notice.repository;

import com.bgmagitapi.kml.notice.entity.KmlNotice;
import com.bgmagitapi.kml.notice.repository.query.KmlNoticeQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KmlNoticeRepository extends JpaRepository<KmlNotice, Long>, KmlNoticeQueryRepository {
}
