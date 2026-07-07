package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitMenuRole;
import com.bgmagitapi.origin.repository.custom.BgmAgitMenuRoleCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BgmAgitMenuRoleRepository extends JpaRepository<BgmAgitMenuRole, Long>, BgmAgitMenuRoleCustomRepository {

    List<BgmAgitMenuRole> findByBgmAgitMainMenu_BgmAgitMainMenuId(Long menuId);

    void deleteByBgmAgitMainMenu_BgmAgitMainMenuId(Long menuId);
}
