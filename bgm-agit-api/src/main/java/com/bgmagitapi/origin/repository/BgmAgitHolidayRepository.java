package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitHoliday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BgmAgitHolidayRepository extends JpaRepository<BgmAgitHoliday, Long> {

    Optional<BgmAgitHoliday> findByBgmAgitHolidayDate(LocalDate date);

    List<BgmAgitHoliday> findByBgmAgitHolidayDateBetweenOrderByBgmAgitHolidayDateAsc(LocalDate from, LocalDate to);
}
