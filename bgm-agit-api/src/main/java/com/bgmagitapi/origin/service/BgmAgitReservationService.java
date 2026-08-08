package com.bgmagitapi.origin.service;

import com.bgmagitapi.origin.apiresponse.ApiResponse;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationCreateRequest;
import com.bgmagitapi.origin.controller.request.BgmAgitReservationModifyRequest;
import com.bgmagitapi.origin.controller.response.BgmAgitReservationResponse;
import com.bgmagitapi.origin.controller.response.reservation.AdminReservationBoardResponse;
import com.bgmagitapi.origin.controller.response.reservation.GroupedReservationResponse;
import com.bgmagitapi.origin.payment.controller.response.PaymentOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface BgmAgitReservationService {

    BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id,LocalDate date);

    /**
     * 항목 여러 개를 합쳐 예약할 때(예: M-1 + M-2) 쓰는 조회.
     * 가능 시간대는 선택 항목 전체의 교집합, 최대인원은 합산으로 내려준다.
     */
    BgmAgitReservationResponse getReservation(Long labelGb, String link, Long id, List<Long> extraIds, LocalDate date);

    ApiResponse createReservation(BgmAgitReservationCreateRequest request, Long jwt);

    Page<GroupedReservationResponse> getReservationDetail(Long memberId, String role, String startDate, String endDate, Pageable pageable);

    /**
     * 관리자 예약 현황판. 하루치 예약을 예약장소 × 시간축으로 묶어서 반환한다.
     * 회원 연락처가 그대로 나가므로 관리자 외에는 차단한다.
     */
    AdminReservationBoardResponse getReservationBoard(LocalDate date, List<String> roles);

    ApiResponse modifyReservation(Long id, BgmAgitReservationModifyRequest request, String role);

    // 예약 결제 주문 생성: 예약 검증·금액계산 후 공통 PaymentService.createOrder 호출
    PaymentOrderResponse createPaymentOrder(Long reservationNo, Long userId);
}
