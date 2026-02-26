package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMainMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitMainMenuRepository extends JpaRepository<BgmAgitMainMenu, Long> {
    List<BgmAgitMainMenu> findByBgmAgitUseStatusTrue();
}
