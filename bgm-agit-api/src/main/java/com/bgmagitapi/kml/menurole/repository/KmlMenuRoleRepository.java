package com.bgmagitapi.kml.menurole.repository;

import com.bgmagitapi.kml.menurole.entity.KmlMenuRole;
import com.bgmagitapi.kml.menurole.repository.query.KmlMenuRoleQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KmlMenuRoleRepository extends JpaRepository<KmlMenuRole, Long>, KmlMenuRoleQueryRepository {
}
