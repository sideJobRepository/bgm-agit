package com.bgmagitapi.origin.repository.custom;

import com.bgmagitapi.origin.controller.response.reservation.ReservedTimeDto;
import com.bgmagitapi.origin.entity.BgmAgitImage;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.bgmagitapi.origin.service.response.BizTalkCancel;
import com.querydsl.jpa.impl.JPAQuery;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitReservationCustomRepository{
    
    List<ReservedTimeDto> findReservations(Long labelGb, String link,Long id, LocalDate today,LocalDate endOfYear);
    
    List<BgmAgitReservation> findExistingReservations(BgmAgitImage image, LocalDate startDate, String cancelStatus);

    /**
     * 결제 승인 직전 슬롯 재검증용.
     * 지정한 항목·날짜에서 이미 확정(취소 아님)된 예약을, 자기 예약번호는 빼고 조회한다.
     */
    List<BgmAgitReservation> findConfirmedReservations(List<Long> imageIds, LocalDate startDate, Long excludeReservationNo);
    
    long updateCancelAndApprovalStatus( String cancelStatus, String approvalStatus,List<Long> idList);
    
    Long findMaxReservationNo();
    
    JPAQuery<Long> countReservationsDistinctForDetail(Long memberId, boolean isUserRole, LocalDate start, LocalDate end);
    
    BizTalkCancel findBizTalkCancel(Long reservationNo);
    
    List<BgmAgitReservation> findReservationList(Long reservationNo);
    
    List<Long> findReservationNosPageForDetail(Long memberId, boolean isUserRole, LocalDate start, LocalDate end, Pageable pageable);
    
    List<BgmAgitReservation> findReservationsByNosForDetail(List<Long> reservationNos, Long memberId, boolean isUserRole, LocalDate start, LocalDate end);

    /** 관리자 현황판용. 해당 일자의 예약 슬롯 전체를 페이징 없이 조회한다. */
    List<BgmAgitReservation> findReservationsByDate(LocalDate date);


}
