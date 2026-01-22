package com.bgmagitapi.kml.yakamantype.repository;

import com.bgmagitapi.kml.yakamantype.entity.YakumanType;
import com.bgmagitapi.kml.yakamantype.repository.query.YakumanTypeQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YakumanTypeRepository extends JpaRepository<YakumanType, Long>, YakumanTypeQueryRepository {
}
