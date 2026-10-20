package com.bgmagitapi.origin.controller.response.reservation;

import com.bgmagitapi.origin.entity.BgmAgitMember;
import com.bgmagitapi.origin.entity.BgmAgitReservation;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
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
    // 결제된 건의 토스 영수증 URL. 미결제/취소건은 null (부분환불돼도 링크는 유지된다)
    private String receiptUrl;
    // 아직 환불되지 않고 남아 있는 결제 금액. 미결제건은 0
    private Integer paidAmount;
    /**
     * 지금 취소하면 적용될 환불 비율(%)과 금액. 취소 확인 모달의 안내용이다.
     *
     * 목록을 열어둔 채 48시간 경계를 넘기면 이 값과 실제 환불액이 갈린다.
     * 그래서 손님에게 최종 확인시키는 문구는 취소 API 응답(실제 처리액)을 써야 한다.
     */
    private Integer refundRate;
    private Integer refundAmount;

    private List<TimeSlot> timeSlots;
    
    public GroupedReservationResponse(BgmAgitReservation reservation) {
        this.reservationId = reservation.getBgmAgitReservationId();
        // 예약 1건이 이어진 한 구간이라 timeSlots 는 원소 1개짜리 배열이다(프론트 표시 코드 호환용)
        this.timeSlots = List.of(new TimeSlot(
                formatTime(reservation.getBgmAgitReservationStartTime()),
                formatTime(reservation.getBgmAgitReservationEndTime())));
        // 예약 장소명 (합쳐 예약이면 "M-1, M-2")
        this.reservationAddr = reservation.getRoomNames();
        this.reservationDate = reservation.getBgmAgitReservationStartDate();
        this.registDate = reservation.getRegistDate();
        this.approvalStatus = reservation.getBgmAgitReservationApprovalStatus();
        this.cancelStatus = reservation.getBgmAgitReservationCancelStatus();
        this.reservationPeople = reservation.getBgmAgitReservationPeople();
        this.reservationRequest = reservation.getBgmAgitReservationRequest();
        BgmAgitMember member = reservation.getBgmAgitMember();
        if (member != null) {
            this.reservationMemberName = member.getBgmAgitMemberName();
            if (member.getBgmAgitMemberPhoneNo() != null) {
                this.phoneNo = this.replacePhoneNo(member.getBgmAgitMemberPhoneNo());
            }
        }
    }

    private static String formatTime(LocalTime time) {
        return time == null ? null : time.format(DateTimeFormatter.ofPattern("HH:mm"));
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
