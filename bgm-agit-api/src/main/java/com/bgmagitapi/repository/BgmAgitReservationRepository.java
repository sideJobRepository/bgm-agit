package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.repository.costom.BgmAgitReservationCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitReservationRepository extends JpaRepository<BgmAgitReservation, Long> , BgmAgitReservationCustomRepository {
    


    
}
