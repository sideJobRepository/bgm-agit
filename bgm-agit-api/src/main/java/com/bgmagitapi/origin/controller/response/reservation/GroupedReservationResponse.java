package com.bgmagitapi.origin.controller.response.reservation;

import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class GroupedReservationResponse {
    private Long reservationNo;
    private LocalDate reservationDate;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime registDate;
    private String approvalStatus;
    private String cancelStatus;
    private String reservationMemberName;
    private String reservationAddr;
    private Integer reservationPeople;
    private String reservationRequest;
    private String phoneNo;
    // 결제 완료(DONE)건의 토스 영수증 URL. 미결제/취소건은 null
    private String receiptUrl;

    private List<TimeSlot> timeSlots;
    
    public GroupedReservationResponse(Long reservationNo, List<BgmAgitReservation> list) {
        this.reservationNo = reservationNo;
        // 항목을 합쳐 예약하면 같은 시간대가 항목 수만큼 들어오므로 중복 제거
        this.timeSlots = list.stream()
                .map(r -> r.getBgmAgitReservationStartTime() + "~" + r.getBgmAgitReservationEndTime())
                .distinct()
                .map(slot -> slot.split("~"))
                .map(times -> new GroupedReservationResponse.TimeSlot(times[0], times[1]))
                .toList();
        // 예약 항목명 (합쳐 예약이면 "M-1, M-2")
        this.reservationAddr = list.stream()
                .map(r -> r.getBgmAgitImage().getBgmAgitImageLabel())
                .distinct()
                .collect(Collectors.joining(", "));


        for (BgmAgitReservation reservation : list) {
            this.reservationDate =  reservation.getBgmAgitReservationStartDate();
            this.registDate = reservation.getRegistDate();
            this.approvalStatus =   reservation.getBgmAgitReservationApprovalStatus();
            this.cancelStatus =   reservation.getBgmAgitReservationCancelStatus();
            this.reservationMemberName =  reservation.getBgmAgitMember().getBgmAgitMemberName();
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
            break;
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
