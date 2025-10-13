package com.bgmagitapi.controller.response.reservation;

import com.bgmagitapi.entity.BgmAgitReservation;
import lombok.*;

import java.time.LocalDate;
import java.util.List;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class GroupedReservationResponse {
    private Long reservationNo;
    private LocalDate reservationDate;
    
    private String approvalStatus;
    private String cancelStatus;
    private String reservationMemberName;
    private String reservationAddr;
    private Integer reservationPeople;
    private String reservationRequest;
    private String phoneNo;
    
    private List<TimeSlot> timeSlots;
    
    public GroupedReservationResponse(Long reservationNo, List<BgmAgitReservation> list) {
        this.reservationNo = reservationNo;
        this.timeSlots = list.stream()
                .map(r -> new GroupedReservationResponse.TimeSlot(
                        r.getBgmAgitReservationStartTime().toString(),
                        r.getBgmAgitReservationEndTime().toString()))
                .toList();
        
        for (BgmAgitReservation reservation : list) {
            this.reservationDate =  reservation.getBgmAgitReservationStartDate();
            this.approvalStatus =   reservation.getBgmAgitReservationApprovalStatus();
            this.cancelStatus =   reservation.getBgmAgitReservationCancelStatus();
            this.reservationMemberName =  reservation.getBgmAgitMember().getBgmAgitMemberName();
            this.reservationAddr =  reservation.getBgmAgitImage().getBgmAgitImageLabel();
            this.reservationPeople = reservation.getBgmAgitReservationPeople();
            this.reservationRequest =  reservation.getBgmAgitReservationRequest();
            boolean isMember = reservation.getBgmAgitMember() != null;
            boolean isPhoneNo = false;
            if(isMember) {
                isPhoneNo = reservation.getBgmAgitMember().getBgmAgitMemberPhoneNo() != null;
            }
            if (isMember && isPhoneNo) {
                this.phoneNo = this.replacePhoneNo(reservation.getBgmAgitMember().getBgmAgitMemberPhoneNo());
            }
        }
    
    }
    
    @Getter
    @Setter
    public static class TimeSlot {
        private String startTime;
        private String endTime;
        
        public TimeSlot(String startTime, String endTime) {
            this.startTime = startTime;
            this.endTime = endTime;
        }
    }
    
    private String replacePhoneNo(String phoneNo) {
        return phoneNo
                .replace("+82", "0")
                .replaceAll("\\s+", "");
    }
}
