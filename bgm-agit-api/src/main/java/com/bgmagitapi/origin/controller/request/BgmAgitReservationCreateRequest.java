package com.bgmagitapi.origin.controller.request;

import com.bgmagitapi.origin.entity.enumeration.BgmAgitImageCategory;
import com.bgmagitapi.origin.util.SlotSchedule;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitReservationCreateRequest {
    
    // 이미지 ID (기준 항목)
    @NotNull(message = "이미지 ID는 필수입니다.")
    private Long bgmAgitImageId ;
    // 함께 예약할 항목들 (예: M-1 예약에 M-2를 붙여 테이블 합치기). 없으면 단일 예약
    private List<Long> bgmAgitImageIds;
    //예약타입
    @NotBlank(message = "예약 타입을 정해주세요")
    private String bgmAgitReservationType;
    // 시작일
    @NotEmpty(message = "예약 시작일은 필수입니다.")
    private String bgmAgitReservationStartDate; //
    
    // 시작 시간
    private LocalTime bgmAgitReservationStartTime;
    
    // 종료 시간
    private LocalTime bgmAgitReservationEndTime;
    
    //예약인원
    @NotNull(message = "예약 인원은 필수 입니다.")
    private Integer bgmAgitReservationPeople;
    
    //요청 사항
    private String bgmAgitReservationRequest;
    
    @NotNull(message = "예약 시작 시간은 필수입니다.")
    private List<String> startTimeEndTime;
    
    private String recipient;
    
    /**
     * 요청된 시간 문자열 리스트로부터 1시간 단위 슬롯을 생성하는 유틸 메서드
     */
    public List<String> getReservationExpandedTimeSlots(BgmAgitImageCategory bgmAgitImageCategory , String imageLabel) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        List<String> result = new ArrayList<>();
        
        // 이용 시간은 SlotSchedule(정책 단일 출처) 기준
        long hoursToAdd = SlotSchedule.of(bgmAgitImageCategory, imageLabel, LocalDate.now()).durationHours();

        for (String timeStr : startTimeEndTime) {
            LocalTime start = LocalTime.parse(timeStr, formatter);
            LocalTime end = start.plusHours(hoursToAdd);
            result.add(start.format(formatter) + " ~ " + end.format(formatter));
        }
        return result;
    }
}
