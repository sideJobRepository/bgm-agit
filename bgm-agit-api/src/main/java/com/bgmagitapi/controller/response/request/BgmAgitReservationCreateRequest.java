package com.bgmagitapi.controller.response.request;

import com.bgmagitapi.entity.enumeration.Reservation;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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
    @NotNull(message = "예약 시작일은 필수입니다.")
    @FutureOrPresent(message = "예약 시작일은 오늘 이후여야 합니다.")
    private LocalDate bgmAgitReservationStartDate;
    // 시작 시간
    @NotNull(message = "예약 시작 시간은 필수입니다.")
    private LocalTime bgmAgitReservationStartTime;
    // 종료 시간
    
    @NotNull(message = "예약 종료 시간은 필수입니다.")
    private LocalTime bgmAgitReservationEndTime;
}
