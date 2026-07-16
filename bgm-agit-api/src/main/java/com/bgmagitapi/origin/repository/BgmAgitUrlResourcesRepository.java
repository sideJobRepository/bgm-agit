package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitUrlResources;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BgmAgitUrlResourcesRepository extends JpaRepository<BgmAgitUrlResources, Long> {

    Optional<BgmAgitUrlResources> findByBgmAgitUrlHttpMethodAndBgmAgitUrlResourcesPath(String httpMethod, String path);
}
