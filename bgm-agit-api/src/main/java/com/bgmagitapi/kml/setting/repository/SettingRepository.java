package com.bgmagitapi.kml.setting.repository;

import com.bgmagitapi.kml.setting.entity.Setting;
import com.bgmagitapi.kml.setting.repository.query.SettingQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;


public interface SettingRepository extends JpaRepository<Setting, Long>, SettingQueryRepository {

}
