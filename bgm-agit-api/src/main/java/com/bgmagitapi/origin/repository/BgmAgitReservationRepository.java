package com.bgmagitapi.origin.repository;

import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.repository.custom.BgmAgitReservationCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitReservationRepository extends JpaRepository<BgmAgitReservation, Long> , BgmAgitReservationCustomRepository {
    


    
}
