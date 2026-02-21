package com.bgmagitapi.kml.yakuman.repository;

import com.bgmagitapi.kml.yakuman.entity.Yakuman;
import com.bgmagitapi.kml.yakuman.repository.query.YakumanQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YakumanRepository extends JpaRepository<Yakuman, Long>, YakumanQueryRepository {


}
