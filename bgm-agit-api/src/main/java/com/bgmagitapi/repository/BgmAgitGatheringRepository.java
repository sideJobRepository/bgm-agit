package com.bgmagitapi.repository;

import com.bgmagitapi.entity.BgmAgitGathering;
import com.bgmagitapi.entity.enumeration.GatheringStatus;
import com.bgmagitapi.entity.enumeration.GatheringType;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BgmAgitGatheringRepository extends JpaRepository<BgmAgitGathering, Long> {

    // 신청 트랜잭션에서 정원 판정 시 동시성 보호 (비관적 락)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from BgmAgitGathering g where g.bgmAgitGatheringId = :id")
    Optional<BgmAgitGathering> findByIdForUpdate(@Param("id") Long id);

    Page<BgmAgitGathering> findByGatheringType(GatheringType gatheringType, Pageable pageable);

    Page<BgmAgitGathering> findByGatheringStatus(GatheringStatus gatheringStatus, Pageable pageable);

    Page<BgmAgitGathering> findByGatheringTypeAndGatheringStatus(GatheringType gatheringType, GatheringStatus gatheringStatus, Pageable pageable);
}
