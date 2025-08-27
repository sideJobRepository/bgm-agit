package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.repository.costom.BgmAgitReservationCustomRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BgmAgitReservationRepository extends JpaRepository<BgmAgitReservation, Long> , BgmAgitReservationCustomRepository {
    


    
}
