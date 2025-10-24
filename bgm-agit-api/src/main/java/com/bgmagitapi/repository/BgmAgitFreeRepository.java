package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitFree;
import com.bgmagitapi.repository.custom.BgmAgitFreeCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitFreeRepository extends JpaRepository<BgmAgitFree, Long> , BgmAgitFreeCustomRepository {
}
