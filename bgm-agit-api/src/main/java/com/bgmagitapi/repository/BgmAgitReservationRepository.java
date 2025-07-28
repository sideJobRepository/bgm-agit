package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitReservationRepository extends JpaRepository<BgmAgitReservation, Long> {
    
    List<BgmAgitReservation> findByBgmAgitImageAndBgmAgitReservationStartDate(BgmAgitImage image, LocalDate kstDate);
}
