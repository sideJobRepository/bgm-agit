package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitMonthlyPass;
import com.bgmagitapi.origin.repository.custom.BgmAgitMonthlyPassCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitMonthlyPassRepository extends JpaRepository<BgmAgitMonthlyPass, Long>, BgmAgitMonthlyPassCustomRepository {
}
