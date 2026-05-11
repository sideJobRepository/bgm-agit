package com.bgmagitapi.kml.menu.repository;

import com.bgmagitapi.kml.menu.entity.KmlMenu;
import com.bgmagitapi.kml.menu.repository.query.KmlMenuQueryRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KmlMenuRepository extends JpaRepository<KmlMenu, Long> , KmlMenuQueryRepository {

    boolean existsByMenuLink(String menuLink);

    boolean existsByMenuLinkAndIdNot(String menuLink, Long id);

    boolean existsByParentMenuId_Id(Long parentMenuId);

}
