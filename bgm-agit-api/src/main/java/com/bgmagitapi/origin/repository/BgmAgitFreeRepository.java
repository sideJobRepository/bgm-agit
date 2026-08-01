package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitFree;
import com.bgmagitapi.origin.repository.custom.BgmAgitFreeCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitFreeRepository extends JpaRepository<BgmAgitFree, Long> , BgmAgitFreeCustomRepository {


}
