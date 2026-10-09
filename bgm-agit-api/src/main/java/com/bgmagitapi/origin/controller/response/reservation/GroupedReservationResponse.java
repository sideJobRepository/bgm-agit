package com.bgmagitapi.origin.controller.response.reservation;

import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class GroupedReservationResponse {
    private Long reservationId;
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

    // 예약 1건 = 이어진 한 구간이라 항상 1개. 배열로 두는 건 프론트 표시 코드를 그대로 쓰기 위해서다
    private List<TimeSlot> timeSlots;
    
    public GroupedReservationResponse(BgmAgitReservation reservation) {
        this.reservationId = reservation.getBgmAgitReservationId();
        this.timeSlots = (reservation.getBgmAgitReservationStartTime() == null || reservation.getBgmAgitReservationEndTime() == null)
                ? List.of()
                : List.of(new TimeSlot(
                        reservation.getBgmAgitReservationStartTime().toString(),
                        reservation.getBgmAgitReservationEndTime().toString()));
        // 예약 항목명 (합쳐 예약이면 "M-1, M-2")
        this.reservationAddr = reservation.getRoomNames();
        this.reservationDate = reservation.getBgmAgitReservationStartDate();
        this.registDate = reservation.getRegistDate();
        this.approvalStatus = reservation.getBgmAgitReservationApprovalStatus();
        this.cancelStatus = reservation.getBgmAgitReservationCancelStatus();
        this.reservationPeople = reservation.getBgmAgitReservationPeople();
        this.reservationRequest = reservation.getBgmAgitReservationRequest();
        if (reservation.getBgmAgitMember() != null) {
            this.reservationMemberName = reservation.getBgmAgitMember().getBgmAgitMemberName();
            String phone = reservation.getBgmAgitMember().getBgmAgitMemberPhoneNo();
            if (phone != null) {
                this.phoneNo = replacePhoneNo(phone);
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
                .replaceAll("\s+", "");
    }
}
