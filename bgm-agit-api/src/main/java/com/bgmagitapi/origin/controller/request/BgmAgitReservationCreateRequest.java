package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BgmAgitReservationCreateRequest {
    
    // 방 ID (기준 방)
    @NotNull(message = "방 ID는 필수입니다.")
    private Long roomId;
    // 함께 예약할 방들 (예: M-1 예약에 M-2를 붙여 테이블 합치기). 없으면 단일 예약
    private List<Long> roomIds;
    // 예약타입 — 서버가 방 링크로 결정하므로 무시한다(프론트 호환용으로만 받음)
    private String bgmAgitReservationType;
    // 시작일 ("YYYY-MM-DDT00:00:00+09:00")
    @NotEmpty(message = "예약 시작일은 필수입니다.")
    private String bgmAgitReservationStartDate;
    
    //예약인원
    @NotNull(message = "예약 인원은 필수 입니다.")
    private Integer bgmAgitReservationPeople;
    
    //요청 사항
    private String bgmAgitReservationRequest;
    
    // 고른 슬롯의 시작 시각들("13:00"). 서버가 SlotSchedule 로 슬롯을 복원하고 이어진 구간인지 검사한다
    @NotNull(message = "예약 시작 시간은 필수입니다.")
    private List<String> startTimeEndTime;
    
    private String recipient;
}
