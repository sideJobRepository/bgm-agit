package com.bgmagitapi.kml.menurole.repository;

import com.bgmagitapi.kml.menurole.entity.KmlMenuRole;
import com.bgmagitapi.kml.menurole.repository.query.KmlMenuRoleQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KmlMenuRoleRepository extends JpaRepository<KmlMenuRole, Long>, KmlMenuRoleQueryRepository {

    void deleteByMenu_Id(Long menuId);

    List<KmlMenuRole> findByMenu_Id(Long menuId);
}
