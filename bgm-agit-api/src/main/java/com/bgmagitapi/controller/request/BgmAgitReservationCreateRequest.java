package com.bgmagitapi.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalTime;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitReservationCreateRequest {
    
    // 이미지 ID
    @NotNull(message = "이미지 ID는 필수입니다.")
    private Long bgmAgitImageId ;
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
    
    @NotNull(message = "예약 시작 시간은 필수입니다.")
    private List<String> startTimeEndTime;
    
    /**
     * 요청된 시간 문자열 리스트로부터 1시간 단위 슬롯을 생성하는 유틸 메서드
     */
    public List<String> getReservationExpandedTimeSlots() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        Set<LocalTime> timeSet = new TreeSet<>();
        
        // 시간들 모으기 (중복 제거 + 정렬)
        for (String timeStr : startTimeEndTime) {
            LocalTime start = LocalTime.parse(timeStr, formatter);
            LocalTime end = start.plusHours(1);
            timeSet.add(start);
            timeSet.add(end);
        }
        
        List<LocalTime> timeList = new ArrayList<>(timeSet);
        List<String> timeRanges = new ArrayList<>();
        
        // ["14:00", "15:00", "16:00"] → "14:00 ~ 15:00", "15:00 ~ 16:00"
        for (int i = 0; i < timeList.size() - 1; i++) {
            String from = timeList.get(i).format(formatter);
            String to = timeList.get(i + 1).format(formatter);
            timeRanges.add(from + " ~ " + to);
        }
        
        return timeRanges;
    }
}
