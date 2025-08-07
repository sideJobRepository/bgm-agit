package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMenuRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BgmAgitMenuRoleRepository extends JpaRepository<BgmAgitMenuRole, Long> {
    
    @Query("""
    SELECT m.bgmAgitMainMenu.bgmAgitMainMenuId
    FROM BgmAgitMenuRole m
    JOIN m.bgmAgitRole r
    WHERE r.bgmAgitRoleName IN :roles
""")
    List<Long> findMenuIdsByRoleNames(List<String> roles);
    
    
}
