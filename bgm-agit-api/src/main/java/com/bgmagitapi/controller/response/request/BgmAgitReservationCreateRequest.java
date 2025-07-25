package com.bgmagitapi.controller.response.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.time.LocalTime;

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
    private LocalDate bgmAgitReservationStartDate;
    
    // 시작 시간
    private LocalTime bgmAgitReservationStartTime;
    
    // 종료 시간
    private LocalTime bgmAgitReservationEndTime;
    
    @NotNull(message = "예약 시작 시간은 필수입니다.")
    private List<String> startTimeEndTime;
}
