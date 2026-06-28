package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMenuRole;
import com.bgmagitapi.repository.custom.BgmAgitMenuRoleCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitMenuRoleRepository extends JpaRepository<BgmAgitMenuRole, Long>, BgmAgitMenuRoleCustomRepository {

    List<BgmAgitMenuRole> findByBgmAgitMainMenu_BgmAgitMainMenuId(Long menuId);

    void deleteByBgmAgitMainMenu_BgmAgitMainMenuId(Long menuId);
}
