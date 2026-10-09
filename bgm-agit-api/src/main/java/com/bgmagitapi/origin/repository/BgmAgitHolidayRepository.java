package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitHoliday;
import com.bgmagitapi.origin.repository.custom.BgmAgitHolidayCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitHolidayRepository extends JpaRepository<BgmAgitHoliday, Long>, BgmAgitHolidayCustomRepository {
}
