package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitMenuRole;
import com.bgmagitapi.repository.costom.BgmAgitMenuRoleCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BgmAgitMenuRoleRepository extends JpaRepository<BgmAgitMenuRole, Long>, BgmAgitMenuRoleCustomRepository {

}
