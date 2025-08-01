package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitReservationRepository extends JpaRepository<BgmAgitReservation, Long> {
    
    List<BgmAgitReservation> findByBgmAgitImageAndBgmAgitReservationStartDateAndBgmAgitReservationCancelStatus(
            BgmAgitImage image,
            LocalDate startDate,
            String cancelStatus
    );

    
    @Query("SELECT MAX(r.bgmAgitReservationNo) FROM BgmAgitReservation r")
    Long findMaxReservationNo();
    
    
    @Modifying(clearAutomatically = true)
    @Query("""
    UPDATE BgmAgitReservation r
    SET r.bgmAgitReservationCancelStatus = :cancelStatus,
        r.bgmAgitReservationApprovalStatus = :approvalStatus
    WHERE r.bgmAgitReservationId IN :idList
""")
    void bulkUpdateCancelAndApprovalStatus(
            @Param("cancelStatus") String cancelStatus,
            @Param("approvalStatus") String approvalStatus,
            @Param("idList") List<Long> idList
    );

    
}
