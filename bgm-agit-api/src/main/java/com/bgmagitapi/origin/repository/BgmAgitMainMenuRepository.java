package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitMainMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitMainMenuRepository extends JpaRepository<BgmAgitMainMenu, Long> {
    List<BgmAgitMainMenu> findByBgmAgitUseStatusTrue();

    List<BgmAgitMainMenu> findAllByOrderByBgmAgitAreaIdAsc();

    boolean existsByBgmAgitMenuLink(String menuLink);

    boolean existsByBgmAgitMenuLinkAndBgmAgitMainMenuIdNot(String menuLink, Long menuId);

    boolean existsByParentMenu_BgmAgitMainMenuId(Long parentMenuId);
}
