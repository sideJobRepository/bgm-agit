package com.bgmagitapi.repository.costom;

import com.bgmagitapi.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.entity.BgmAgitImage;
import com.bgmagitapi.entity.BgmAgitReservation;
import com.bgmagitapi.service.response.BizTalkCancel;
import com.querydsl.jpa.impl.JPAQuery;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitReservationCustomRepository{
    
    List<ReservedTimeDto> findReservations(Long labelGb, String link,Long id, LocalDate today,LocalDate endOfYear);
    
    List<BgmAgitReservation> findExistingReservations(BgmAgitImage image, LocalDate startDate, String cancelStatus);
    
    long updateCancelAndApprovalStatus( String cancelStatus, String approvalStatus,List<Long> idList);
    
    Long findMaxReservationNo();
    
    List<BgmAgitReservation> findReservationsForDetail( Long memberId, boolean isUserRole, LocalDate start, LocalDate end, Pageable pageable);
    
    JPAQuery<Long> countReservationsDistinctForDetail(Long memberId, boolean isUserRole, LocalDate start, LocalDate end);
    
    BizTalkCancel findBizTalkCancel(Long reservationNo);
    
    List<BgmAgitReservation> findReservationList(Long reservationNo);
    
}
