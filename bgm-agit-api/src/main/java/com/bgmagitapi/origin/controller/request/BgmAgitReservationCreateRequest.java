package com.bgmagitapi.origin.controller.request;

import jakarta.validation.constraints.NotBlank;
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

    // 함께 예약할 방들 (예: M-1 예약에 M-2를 붙여 합쳐 예약). 없으면 단일 예약
    private List<Long> roomIds;

    // 예약타입. 서버는 방의 메뉴 링크로 다시 결정하므로 값은 쓰지 않는다(프론트 계약 유지용)
    @NotBlank(message = "예약 타입을 정해주세요")
    private String bgmAgitReservationType;

    // 시작일 (`${ymd}T00:00:00+09:00`, ZonedDateTime 파싱)
    @NotEmpty(message = "예약 시작일은 필수입니다.")
    private String bgmAgitReservationStartDate;

    //예약인원
    @NotNull(message = "예약 인원은 필수 입니다.")
    private Integer bgmAgitReservationPeople;

    //요청 사항
    private String bgmAgitReservationRequest;

    // 선택한 슬롯의 시작 시각들("HH:mm"). 이어진 구간이어야 하며 서버가 첫 시작 ~ 마지막 끝 한 구간으로 저장한다
    @NotEmpty(message = "예약 시작 시간은 필수입니다.")
    private List<String> startTimeEndTime;

    private String recipient;
}
